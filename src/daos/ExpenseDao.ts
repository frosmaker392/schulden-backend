import { nanoid } from 'nanoid'
import * as Neo4J from 'neo4j-driver'

import PersonAdapter from '../adapters/PersonAdapter'
import { Debtor, Expense, Person } from '../models'

import {
  DBExpense,
  DBPerson,
  DBRelShouldPay,
  DBUser,
  Neo4JEntity
} from '../typeDefs'
import Neo4JUtil from '../utils/Neo4JUtil'
import { Optional } from '../utils/utilityTypes'
import { UserDao } from './UserDao'

export interface ExpenseForm {
  name: string
  totalAmount: number
  payerId: string
  debtors: {
    personId: string
    amount: number
  }[]
}

export interface ExpenseDao {
  create(expenseForm: ExpenseForm, actorId: string): Promise<Expense>
  getAll(personId: string, actorId: string): Promise<Expense[]>
  deleteById(id: string): Promise<Optional<Expense>>
}

export class ExpenseMemoryDao implements ExpenseDao {
  private expenses: Expense[] = []
  constructor(private userDao: UserDao) {}

  async create(expenseForm: ExpenseForm): Promise<Expense> {
    const { name, totalAmount, payerId } = expenseForm
    const id = (Math.random() * 10000).toFixed(0)

    const debtors: Debtor[] = await Promise.all(
      expenseForm.debtors.map(async ({ personId, amount }) => {
        const user = await this.userDao.getUniqueById(personId)

        if (!user) throw new Error(`Cannot find user with id ${personId}`)
        return new Debtor(user, amount)
      })
    )

    const payer: Person = await this.userDao
      .getUniqueById(payerId)
      .then((u) => {
        if (!u) throw new Error(`Cannot find user with id ${payerId}`)
        return u
      })

    const expense = new Expense(
      id,
      name,
      new Date(),
      totalAmount,
      payer,
      debtors
    )

    this.expenses.push(expense)
    return expense
  }

  async getAll(personId: string, actorId: string): Promise<Expense[]> {
    return this.expenses.filter((e) => {
      if (personId === actorId)
        return (
          e.payer.id === personId ||
          e.debtors.some((d) => d.person.id === personId)
        )

      return (
        (e.payer.id === actorId &&
          e.debtors.some((d) => d.person.id === personId)) ||
        (e.payer.id === personId &&
          e.debtors.some((d) => d.person.id === actorId)) ||
        (e.debtors.some((d) => d.person.id === actorId) &&
          e.debtors.some((d) => d.person.id === personId))
      )
    })
  }

  async deleteById(id: string): Promise<Optional<Expense>> {
    const indexToDelete = this.expenses.findIndex((e) => e.id === id)
    if (indexToDelete < 0) return undefined
    const toDelete = this.expenses[indexToDelete]

    this.expenses.splice(indexToDelete, 1)
    return toDelete
  }
}

export class ExpenseNeo4JDao implements ExpenseDao {
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

      const payingPerson = personExpenseRecords[0].get('p')
        .properties as DBPerson
      const debtors = debtorRecords.map((record) => {
        const dbPerson: DBPerson = record.get('p').properties
        const shouldPayRel: DBRelShouldPay = record.get('s').properties

        const person = PersonAdapter.toPersonModel(dbPerson)

        return new Debtor(person, shouldPayRel.amount)
      })
      const expense = personExpenseRecords[0].get('e').properties as DBExpense

      const payer = PersonAdapter.toPersonModel(payingPerson)

      return new Expense(
        id,
        expense.name,
        timestamp,
        expense.totalAmount,
        payer,
        debtors
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
        WITH e ORDER BY e.timestamp
        MATCH (payer:Person)<-[:PAID_BY]-(e)<-[s:SHOULD_PAY]-(d:Person)
        RETURN DISTINCT e, payer, collect(d) as debtors, collect(s) as shouldPayRels`,
        {
          actorId,
          personId
        }
      )

      const expenses = records.map((r) => {
        const dbExpense: DBExpense = r.get('e').properties
        const dbPayer: DBUser = r.get('payer').properties

        const dbDebtors: DBPerson[] = r
          .get('debtors')
          .map((d: Neo4JEntity<DBPerson>) => d.properties)

        const dbShouldPayRels: DBRelShouldPay[] = r
          .get('shouldPayRels')
          .map((d: Neo4JEntity<DBRelShouldPay>) => d.properties)

        const debtors = dbDebtors.map((d, i) => {
          const person: Person = PersonAdapter.toPersonModel(d)

          return new Debtor(person, dbShouldPayRels[i].amount)
        })

        const payer = PersonAdapter.toUserModel(dbPayer)
        return new Expense(
          dbExpense.id,
          dbExpense.name,
          new Date(dbExpense.timestamp),
          dbExpense.totalAmount,
          payer,
          debtors
        )
      })

      return expenses
    })
  }

  deleteById(id: string): Promise<Optional<Expense>> {
    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      const { records } = await session.run(
        `MATCH (e:Expense { id: $id }) RETURN e`,
        { id }
      )

      await session.run(`MATCH (e:Expense { id: $id }) DETACH DELETE e`, { id })

      return records[0].get('e').properties
    })
  }
}
