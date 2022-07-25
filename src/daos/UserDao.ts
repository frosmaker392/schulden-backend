import * as Neo4J from 'neo4j-driver'
import { nanoid } from 'nanoid'

import type { User, ID } from '../typeDefs'
import { Optional, PartialExcept } from '../utils/utilityTypes'
import Dao from './Dao'
import Neo4JUtil from '../utils/Neo4JUtil'

export interface UserDao extends Dao<User> {
  getManyByNameOrEmail(name: string, email: string): Promise<User[]>
}

export class UserMemoryDao implements UserDao {
  private users: User[] = []

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = { ...user, id: (Math.random() * 1000).toFixed(0) }

    this.users.push(newUser)
    return newUser
  }

  getAll = async (): Promise<User[]> => this.users
  getMany = async <K extends keyof User>(
    key: K,
    value: User[K]
  ): Promise<User[]> => this.users.filter((u) => u[key] === value)
  getUnique = async <K extends keyof User>(
    key: K,
    value: User[K]
  ): Promise<Optional<User>> => this.users.find((u) => u[key] === value)

  getManyByNameOrEmail = async (name: string, email: string): Promise<User[]> =>
    this.users.filter((u) => u.name === name || u.email === email)

  async update(user: PartialExcept<User, 'id'>): Promise<Optional<User>> {
    const userIndex = this.users.findIndex((u) => u.id === user.id)

    if (userIndex >= 0) {
      this.users[userIndex] = { ...this.users[userIndex], ...user }
      return this.users[userIndex]
    }

    return undefined
  }

  async deleteById(id: ID): Promise<Optional<User>> {
    const userIndex = this.users.findIndex((u) => u.id === id)

    return userIndex > 0 ? this.users.splice(userIndex, 1)[0] : undefined
  }
}

export class UserNeo4JDao implements UserDao {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  async create(entity: Omit<User, 'id'>): Promise<User> {
    const id = nanoid()

    return await Neo4JUtil.runQuery(
      this.neo4jDriver,
      'write',
      async (session) => {
        const { records } = await session.run(
          `CREATE (user :User { id: $id, name: $name, email: $email, passwordHash: $passwordHash }) 
        RETURN user`,
          { id, ...entity }
        )

        return records[0].get('user').properties
      }
    )
  }

  async getAll(): Promise<User[]> {
    return Neo4JUtil.runQuery(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(`MATCH (u :User) RETURN u`)
      return records.map((r) => r.get('u').properties)
    })
  }

  async getMany<K extends keyof User>(key: K, value: User[K]): Promise<User[]> {
    return Neo4JUtil.runQuery(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User { ${key} : $value }) RETURN u`,
        { value }
      )

      return records.map((r) => r.get('u').properties)
    })
  }

  async getUnique<K extends keyof User>(
    key: K,
    value: User[K]
  ): Promise<Optional<User>> {
    return Neo4JUtil.runQuery(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User { ${key} : $value }) RETURN DISTINCT u`,
        { value }
      )

      return records.at(0)?.get('u').properties
    })
  }

  async getManyByNameOrEmail(name: string, email: string): Promise<User[]> {
    return Neo4JUtil.runQuery(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User) 
        WHERE u.name = $name OR u.email = $email
        RETURN DISTINCT u`,
        { name, email }
      )

      return records.map((r) => r.get('u').properties)
    })
  }

  async update({
    id,
    ...fieldsToUpdate
  }: PartialExcept<User, 'id'>): Promise<Optional<User>> {
    return Neo4JUtil.runQuery(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User { id : $id }) 
        SET u += $fieldsToUpdate
        RETURN u`,
        { id, fieldsToUpdate }
      )

      return records.at(0)?.get('u').properties
    })
  }

  async deleteById(id: string): Promise<Optional<User>> {
    return Neo4JUtil.runQuery(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User { id : $id }) 
        DELETE u`,
        { id }
      )

      return records.at(0)?.get('u').properties
    })
  }
}
