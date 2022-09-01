import * as Neo4J from 'neo4j-driver'
import { nanoid } from 'nanoid'

import { Optional } from '../utils/utilityTypes'
import Neo4JUtil from '../utils/Neo4JUtil'
import { User } from '../models/Person'
import PersonAdapter from '../adapters/PersonAdapter'
import { DBUser } from '../typeDefs'

export class UserDao {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  create(user: Omit<User, 'id'>): Promise<User> {
    const id = nanoid()

    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `CREATE (u:Person:User $userParams) 
        RETURN u`,
        {
          userParams: {
            id,
            name: user.name,
            email: user.email,
            passwordHash: user.passwordHash
          }
        }
      )

      const dbUser = records[0].get('u').properties
      return PersonAdapter.toUserModel(dbUser)
    })
  }

  getById(id: string): Promise<Optional<User>> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u:User { id: $id }) RETURN DISTINCT u`,
        { id }
      )

      const dbUser = records.at(0)?.get('u').properties
      if (!dbUser) return
      return PersonAdapter.toUserModel(dbUser)
    })
  }

  getByName(name: string): Promise<Optional<User>> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u:User { name: $name }) RETURN DISTINCT u`,
        { name }
      )

      const dbUser = records.at(0)?.get('u').properties
      if (!dbUser) return
      return PersonAdapter.toUserModel(dbUser)
    })
  }

  getByEmail(email: string): Promise<Optional<User>> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u:User { email: $email }) RETURN DISTINCT u`,
        { email }
      )

      const dbUser = records.at(0)?.get('u').properties
      if (!dbUser) return
      return PersonAdapter.toUserModel(dbUser)
    })
  }

  findByName(name: string): Promise<User[]> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u:User) WHERE u.name CONTAINS $name RETURN u`,
        { name }
      )

      const dbUsers = records.map((u) => u.get('u').properties as DBUser)
      return dbUsers.map((u) => PersonAdapter.toUserModel(u))
    })
  }
}
