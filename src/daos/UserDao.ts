import * as Neo4J from 'neo4j-driver'
import { nanoid } from 'nanoid'

import { Optional } from '../utils/utilityTypes'
import Neo4JUtil from '../utils/Neo4JUtil'
import { User } from '../models/Person'
import UserAdapter from '../adapters/UserAdapter'

export interface UserDao {
  create(user: Omit<User, 'id'>): Promise<User>
  getUniqueById(id: string): Promise<Optional<User>>
  getUniqueByName(name: string): Promise<Optional<User>>
  getUniqueByEmail(email: string): Promise<Optional<User>>
}

export class UserMemoryDao implements UserDao {
  private users: User[] = []

  async create(user: Omit<User, 'id'>): Promise<User> {
    const id = (Math.random() * 1000).toFixed(0)
    const newUser: User = new User(id, user.name, user.email, user.passwordHash)

    this.users.push(newUser)
    return newUser
  }

  async getUniqueById(id: string): Promise<Optional<User>> {
    return this.users.find((u) => u.id === id)
  }

  async getUniqueByName(name: string): Promise<Optional<User>> {
    return this.users.find((u) => u.name === name)
  }

  async getUniqueByEmail(email: string): Promise<Optional<User>> {
    return this.users.find((u) => u.email === email)
  }
}

export class UserNeo4JDao implements UserDao {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  create(user: Omit<User, 'id'>): Promise<User> {
    const id = nanoid()

    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `CREATE (user :User { id: $id, name: $name, email: $email, passwordHash: $passwordHash }) 
        RETURN user`,
        {
          id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash
        }
      )

      const dbUser = records[0].get('user').properties
      return UserAdapter.toUserModel(dbUser)
    })
  }

  getUniqueById(id: string): Promise<Optional<User>> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User { id: $id }) RETURN DISTINCT u`,
        { id }
      )

      const dbUser = records.at(0)?.get('u').properties
      if (!dbUser) return undefined
      return UserAdapter.toUserModel(dbUser)
    })
  }

  getUniqueByName(name: string): Promise<Optional<User>> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User { name: $name }) RETURN DISTINCT u`,
        { name }
      )

      const dbUser = records.at(0)?.get('u').properties
      if (!dbUser) return undefined
      return UserAdapter.toUserModel(dbUser)
    })
  }

  getUniqueByEmail(email: string): Promise<Optional<User>> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u :User { email: $email }) RETURN DISTINCT u`,
        { email }
      )

      const dbUser = records.at(0)?.get('u').properties
      if (!dbUser) return undefined
      return UserAdapter.toUserModel(dbUser)
    })
  }
}
