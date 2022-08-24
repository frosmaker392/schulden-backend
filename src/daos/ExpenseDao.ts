import { nanoid } from 'nanoid'
import * as Neo4J from 'neo4j-driver'
import ExpenseAdapter from '../adapters/ExpenseAdapter'

import { Expense } from '../models'

import {
  DBExpense,
  DBPerson,
  DBRelShouldPay,
  DBUser,
  Neo4JEntity
} from '../typeDefs'
import Neo4JUtil from '../utils/Neo4JUtil'
import { Optional } from '../utils/utilityTypes'

export interface ExpenseForm {
  name: string
  totalAmount: number
  payerId: string
  debtors: {
    personId: string
    amount: number
  }[]
}

export class ExpenseDao {
  constructor(private neo4jDriver: Neo4J.Driver) {}

  create(expenseForm: ExpenseForm, actorId: string): Promise<Expense> {
    const id = nanoid()
    const timestamp = new Date()

    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      // Create expense and PAID_BY relationship first
      const { records: personExpenseRecords } = await session.run(
        `MATCH (p:Person { id: $payerId })
        WHERE (p:User) OR (p:OfflinePerson)-[:BELONGS_TO]->(:User { id: $actorId })
        CREATE (e:Expense $expense)-[:PAID_BY]->(p)
        RETURN p, e`,
        {
          actorId,
          payerId: expenseForm.payerId,
          expense: <DBExpense>{
            id,
            name: expenseForm.name,
            timestamp: timestamp.toISOString(),
            totalAmount: expenseForm.totalAmount
          }
        }
      )

      // Then link up all debtors with SHOULD_PAY relationships
      const { records: debtorRecords } = await session.run(
        `UNWIND $debtors AS debtor
        MATCH (p:Person { id: debtor.personId }) 
        WHERE (p:User) OR (p:OfflinePerson)-[:BELONGS_TO]->(:User { id: $actorId })
        WITH p, debtor
        MATCH (e:Expense {id: $expenseId})
        CREATE (p)-[s:SHOULD_PAY { amount: debtor.amount }]->(e)
        RETURN p, s`,
        {
          debtors: expenseForm.debtors,
          actorId,
          expenseId: id
        }
      )

      const expense: DBExpense = personExpenseRecords[0].get('e').properties
      const payer: DBPerson = personExpenseRecords[0].get('p').properties

      const debtorPersons: DBPerson[] = debtorRecords.map(
        (r) => r.get('p').properties
      )
      const shouldPayRels: DBRelShouldPay[] = debtorRecords.map(
        (r) => r.get('s').properties
      )

      return ExpenseAdapter.toExpenseModel(
        expense,
        payer,
        debtorPersons,
        shouldPayRels
      )
    })
  }

  getAll(personId: string, actorId: string): Promise<Expense[]> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (p:Person { id: $personId })
        WHERE ($personId = $actorId AND (p:User)) OR (p)-[:BELONGS_TO]->(:User { id: $actorId }) 
        OR (p:User)--(:Expense)--(:User { id: $actorId })
        WITH p
        MATCH (e:Expense)
        WHERE (e)-[:PAID_BY]->(p) OR (e)<-[:SHOULD_PAY]-(p)
        WITH e ORDER BY e.timestamp DESC
        MATCH (payer:Person)<-[:PAID_BY]-(e)<-[s:SHOULD_PAY]-(d:Person)
        RETURN DISTINCT e, payer, collect(d) as debtors, collect(s) as shouldPayRels`,
        {
          actorId,
          personId
        }
      )

      const expenses = records.map((r) => {
        const expense: DBExpense = r.get('e').properties
        const payer: DBUser = r.get('payer').properties

        const debtorPersons: DBPerson[] = r
          .get('debtors')
          .map((d: Neo4JEntity<DBPerson>) => d.properties)

        const shouldPayRels: DBRelShouldPay[] = r
          .get('shouldPayRels')
          .map((d: Neo4JEntity<DBRelShouldPay>) => d.properties)

        return ExpenseAdapter.toExpenseModel(
          expense,
          payer,
          debtorPersons,
          shouldPayRels
        )
      })

      return expenses
    })
  }

  getById(expenseId: string, actorId: string): Promise<Optional<Expense>> {
    return Neo4JUtil.session(this.neo4jDriver, 'read', async (session) => {
      const { records } = await session.run(
        `MATCH (p:Person)<-[:PAID_BY]-(e:Expense { id: $id })<-[s:SHOULD_PAY]-(d:Person)
        RETURN p, e, s, d`,
        { id: expenseId }
      )

      if (records.length === 0) return

      const dbPayer: DBPerson = records[0].get('p').properties
      const dbExpense: DBExpense = records[0].get('e').properties

      const dbShouldPayRels: DBRelShouldPay[] = records.map(
        (r) => r.get('s').properties
      )
      const dbDebtorPersons: DBPerson[] = records.map(
        (r) => r.get('d').properties
      )

      if (
        dbPayer.id === actorId ||
        dbDebtorPersons.some((d) => d.id === actorId)
      )
        return ExpenseAdapter.toExpenseModel(
          dbExpense,
          dbPayer,
          dbDebtorPersons,
          dbShouldPayRels
        )
    })
  }

  deleteById(id: string, actorId: string): Promise<Optional<Expense>> {
    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `MATCH (p:Person)<-[:PAID_BY]-(e:Expense { id: $id })<-[s:SHOULD_PAY]-(d:Person)
        RETURN p, e, s, d`,
        { id }
      )

      if (records.length === 0) return

      const dbPayer: DBPerson = records[0].get('p').properties
      const dbExpense: DBExpense = records[0].get('e').properties

      const dbShouldPayRels: DBRelShouldPay[] = records.map(
        (r) => r.get('s').properties
      )
      const dbDebtorPersons: DBPerson[] = records.map(
        (r) => r.get('d').properties
      )

      if (
        dbPayer.id === actorId ||
        dbDebtorPersons.some((d) => d.id === actorId)
      ) {
        await session.run(`MATCH (e:Expense { id: $id }) DETACH DELETE e`, {
          id
        })

        return ExpenseAdapter.toExpenseModel(
          dbExpense,
          dbPayer,
          dbDebtorPersons,
          dbShouldPayRels
        )
      }
    })
  }
}
