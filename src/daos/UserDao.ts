import * as Neo4J from 'neo4j-driver'
import { nanoid } from 'nanoid'

import type { ID, Optional, PartialExceptId, User } from '../CommonTypes'
import Dao from './Dao'

export class UserMemoryDao implements Dao<User> {
  private users: User[] = []

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = { ...user, id: (Math.random() * 1000).toFixed(0) }

    this.users.push(newUser)
    return newUser
  }

  getAll = async (): Promise<User[]> => this.users

  getBy = async <K extends keyof User>(
    key: K,
    value: User[K]
  ): Promise<User[]> => this.users.filter((u) => u[key] === value)

  getByUnique = async <K extends keyof User>(
    key: K,
    value: User[K]
  ): Promise<Optional<User>> => this.users.find((u) => u[key] === value)

  async update(user: PartialExceptId<User>): Promise<Optional<User>> {
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

export class UserNeo4JDao implements Dao<User> {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  async create(entity: Omit<User, 'id'>): Promise<User> {
    const session = this.neo4jDriver.session()
    const id = nanoid()

    let user: User = { id: 'error', ...entity }

    try {
      const { records } = await session.run(
        `CREATE (user :User { id: $id, name: $name, email: $email, passwordHash: $passwordHash }) 
        RETURN user`,
        { id, ...entity }
      )

      user = records[0].get('user').properties as User
    } catch (e) {
      console.log(e)
    } finally {
      session.close()
    }

    return user
  }

  async getAll(): Promise<User[]> {
    const session = this.neo4jDriver.session({
      defaultAccessMode: Neo4J.session.READ
    })
    let result: User[] = []

    try {
      const { records } = await session.run(`MATCH (u :User) RETURN u`)
      result = records.map((r) => r.get('u').properties as User)
      console.log(result)
    } catch (e) {
      console.log(e)
    } finally {
      session.close()
    }

    return result
  }

  async getBy<K extends keyof User>(key: K, value: User[K]): Promise<User[]> {
    const session = this.neo4jDriver.session({
      defaultAccessMode: Neo4J.session.READ
    })
    let result: User[] = []

    try {
      const { records } = await session.run(
        `MATCH (u :User { ${key} : $value }) RETURN u`,
        { value }
      )

      result = records.map((r) => r.get('u').properties)
    } catch (e) {
      console.log(e)
    } finally {
      session.close()
    }

    return result
  }

  async getByUnique<K extends keyof User>(
    key: K,
    value: User[K]
  ): Promise<Optional<User>> {
    const session = this.neo4jDriver.session({
      defaultAccessMode: Neo4J.session.READ
    })
    let result: Optional<User> = undefined

    try {
      const { records } = await session.run(
        `MATCH (u :User { ${key} : $value }) RETURN u`,
        { value }
      )

      result = records.at(0)?.get('u').properties as User
    } catch (e) {
      console.log(e)
    } finally {
      session.close()
    }

    return result
  }

  async update(entity: PartialExceptId<User>): Promise<Optional<User>> {
    const session = this.neo4jDriver.session()
    let result: Optional<User> = undefined

    const keyValueCsv = Object.entries(entity)
      .filter(([key]) => key !== 'id')
      .map(([key, value]) => `${key}: "${value}"`)
      .join(', ')
    const fieldsToUpdate = `{ ${keyValueCsv} }`

    try {
      const { records } = await session.run(
        `MATCH (u :User { id : $id }) 
        ${fieldsToUpdate}
        RETURN u`,
        { id: entity.id }
      )

      result = records.at(0)?.get('u').properties as User
    } catch (e) {
      console.log(e)
    } finally {
      session.close()
    }

    return result
  }

  async deleteById(id: string): Promise<Optional<User>> {
    const session = this.neo4jDriver.session()
    let result: Optional<User> = undefined

    try {
      const { records } = await session.run(
        `MATCH (u :User { id : $id }) 
        DELETE u`,
        { id }
      )

      result = records.at(0)?.get('u').properties as User
    } catch (e) {
      console.log(e)
    } finally {
      session.close()
    }

    return result
  }
}
