import { nanoid } from 'nanoid'
import * as Neo4J from 'neo4j-driver'

import { OfflinePerson } from '../models'
import { DBOfflinePerson } from '../typeDefs'
import Neo4JUtil from '../utils/Neo4JUtil'
import { Optional } from '../utils/utilityTypes'

export interface OfflinePersonDao {
  create(ownerId: string, name: string): Promise<OfflinePerson>
  getAll(ownerId: string): Promise<OfflinePerson[]>
  deleteById(
    ownerId: string,
    personId: string
  ): Promise<Optional<OfflinePerson>>
}

export class OfflinePersonMemoryDao implements OfflinePersonDao {
  private personsMap: Record<string, OfflinePerson[]> = {}

  async create(ownerId: string, name: string): Promise<OfflinePerson> {
    const id = (Math.random() * 10000).toFixed(0)
    const person = new OfflinePerson(id, name)

    if (this.personsMap[ownerId] === undefined)
      this.personsMap[ownerId] = [person]
    else this.personsMap[ownerId].push(person)

    return person
  }

  async getAll(ownerId: string): Promise<OfflinePerson[]> {
    return this.personsMap[ownerId] ?? []
  }

  async deleteById(
    ownerId: string,
    personId: string
  ): Promise<Optional<OfflinePerson>> {
    const persons = this.personsMap[ownerId]
    if (persons === undefined || persons.length === 0) return

    const indexToDelete = persons.findIndex((p) => p.id === personId)
    if (indexToDelete < 0) return

    return persons.splice(indexToDelete, 1)[0]
  }
}

export class OfflinePersonNeo4JDao implements OfflinePersonDao {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  create(ownerId: string, name: string): Promise<OfflinePerson> {
    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      const id = nanoid()
      const { records } = await session.run(
        `MATCH (u:User { id: $ownerId })
        CREATE (o:Person:OfflinePerson { id: $id, name: $name })-[:BELONGS_TO]->(u)
        RETURN o`,
        {
          ownerId,
          id,
          name
        }
      )

      const person: DBOfflinePerson = records[0].get('o').properties
      return new OfflinePerson(person.id, person.name)
    })
  }

  getAll(ownerId: string): Promise<OfflinePerson[]> {
    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `MATCH (o:OfflinePerson)-[:BELONGS_TO]->(:User { id: $ownerId })
        RETURN o`,
        { ownerId }
      )

      const persons: DBOfflinePerson[] = records.map(
        (r) => r.get('o').properties
      )
      return persons.map((p) => new OfflinePerson(p.id, p.name))
    })
  }

  deleteById(
    ownerId: string,
    personId: string
  ): Promise<Optional<OfflinePerson>> {
    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `MATCH (o:OfflinePerson { id: $personId })-[:BELONGS_TO]->(:User { id: $ownerId })
        RETURN o`,
        {
          personId,
          ownerId
        }
      )

      await session.run(
        `MATCH (o:OfflinePerson { id: $personId })-[:BELONGS_TO]->(:User { id: $ownerId })
        DETACH DELETE o`,
        {
          personId,
          ownerId
        }
      )

      if (records.length === 0) return
      const person: DBOfflinePerson = records[0].get('o').properties
      return new OfflinePerson(person.id, person.name)
    })
  }
}
