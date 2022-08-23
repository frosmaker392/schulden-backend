import { Debtor } from '../models'
import Neo4JUtil from '../utils/Neo4JUtil'

import * as Neo4J from 'neo4j-driver'
import { DBPerson } from '../typeDefs'
import PersonAdapter from '../adapters/PersonAdapter'

export class DebtDao {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  async getAll(userId: string): Promise<Debtor[]> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (u:User { id: $id })-[s:SHOULD_PAY]->(:Expense)-[:PAID_BY]->(p:Person)
        WHERE u.id <> p.id
        WITH u, -sum(s.amount) AS amount, p
        RETURN u, amount, p
        UNION
        MATCH (u:User { id: $id })<-[:PAID_BY]-(e:Expense)<-[s:SHOULD_PAY]-(p:Person)
        WHERE u.id <> p.id
        WITH u, sum(s.amount) as amount, p
        RETURN u, amount, p`,
        { id: userId }
      )

      const debtors = records.map((r) => {
        const person: DBPerson = r.get('p').properties
        const amount: number = r.get('amount')

        return new Debtor(PersonAdapter.toPersonModel(person), amount)
      })

      // Add together two entries that have the same name
      const reduced = debtors.reduce((acc, debtor) => {
        const newAcc: Debtor[] = [...acc]
        const otherEntryIndex = acc.findIndex(
          (existing) => existing.person.id === debtor.person.id
        )

        if (otherEntryIndex >= 0) {
          const otherEntry = newAcc[otherEntryIndex]
          newAcc[otherEntryIndex] = new Debtor(
            otherEntry.person,
            debtor.amount + otherEntry.amount
          )
        } else newAcc.push(debtor)

        return newAcc
      }, [] as Debtor[])

      return reduced.sort((a, b) => a.amount - b.amount)
    })
  }
}
