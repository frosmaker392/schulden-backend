import { nanoid } from 'nanoid'
import * as Neo4J from 'neo4j-driver'

import { Debtor } from '../models/Debt'
import { Expense } from '../models/Expense'
import { OfflinePerson, Person, User } from '../models/Person'
import { DBExpense, DBRelShouldPay, DBUser } from '../typeDefs'
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
  create(expenseForm: ExpenseForm): Promise<Expense>
  getAll(userId: string): Promise<Expense[]>
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

  async getAll(userId: string): Promise<Expense[]> {
    return this.expenses.filter(
      (e) =>
        e.payer.id === userId || e.debtors.some((d) => d.person.id === userId)
    )
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

  create(expenseForm: ExpenseForm): Promise<Expense> {
    const id = nanoid()
    const timestamp = new Date()

    return Neo4JUtil.session(this.neo4jDriver, 'write', async (session) => {
      // Create expense and PAID_BY relationship first
      const { records: userExpenseRecords } = await session.run(
        `MATCH (u:User {id: $payerId})
        CREATE (e:Expense $expense)-[:PAID_BY]->(u)
        RETURN u, e`,
        {
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
        MATCH (p) 
        WHERE ((p:User) OR (p:OfflinePerson)-[:BELONGS_TO]->(:User {id: $ownerId}))
        AND p.id = debtor.personId
        WITH p, debtor
        MATCH (e:Expense {id: $expenseId})
        CREATE (p)-[s:SHOULD_PAY { amount: debtor.amount }]->(e)
        RETURN p, s`,
        {
          debtors: expenseForm.debtors,
          ownerId: expenseForm.payerId,
          expenseId: id
        }
      )

      const payingUser = userExpenseRecords[0].get('u').properties as DBUser
      const debtors = debtorRecords.map((record) => {
        const debtorPerson = record.get('p').properties
        const shouldPayRel = record.get('s').properties as DBRelShouldPay

        let person: Person
        if ('email' in debtorPerson) {
          person = new User(
            debtorPerson.id,
            debtorPerson.name,
            debtorPerson.email,
            debtorPerson.passwordHash
          )
        } else {
          person = new OfflinePerson(debtorPerson.id, debtorPerson.name)
        }

        return new Debtor(person, shouldPayRel.amount)
      })
      const expense = userExpenseRecords[0].get('e').properties as DBExpense

      const payer: Person = new User(
        payingUser.id,
        payingUser.name,
        payingUser.email,
        payingUser.passwordHash
      )

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

  getAll(userId: string): Promise<Expense[]> {
    throw new Error('Method not implemented.')
  }
  deleteById(id: string): Promise<Optional<Expense>> {
    throw new Error('Method not implemented.')
  }
}
