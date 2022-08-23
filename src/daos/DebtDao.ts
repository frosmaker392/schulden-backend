import { Debtor } from '../models'
import Neo4JUtil from '../utils/Neo4JUtil'

import * as Neo4J from 'neo4j-driver'
import { DBPerson } from '../typeDefs'
import PersonAdapter from '../adapters/PersonAdapter'

export class DebtDao {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  async getAllForUser(userId: string): Promise<Debtor[]> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u:User { id: $id })-[s:SHOULD_PAY]->(:Expense)-[:PAID_BY]->(p:Person)
        WHERE u.id <> p.id
        WITH u, -sum(s.amount) AS amount, p
        RETURN u, amount, p
        ORDER BY amount
        UNION
        MATCH (u:User { id: $id })<-[:PAID_BY]-(e:Expense)
        WITH u, e
        MATCH (e)<-[s:SHOULD_PAY]-(p:Person)
        WHERE u.id <> p.id
        WITH u, sum(s.amount) as amount, p
        RETURN u, amount, p
        ORDER BY amount`,
        { id: userId }
      )

      const debtors = records.map((r) => {
        const person: DBPerson = r.get('p').properties
        const amount: number = r.get('amount')

        return new Debtor(PersonAdapter.toPersonModel(person), amount)
      })

      return debtors
    })
  }
}
