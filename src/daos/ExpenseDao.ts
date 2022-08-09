import { Debtor } from '../models/Debt'
import { Expense } from '../models/Expense'
import { Person } from '../models/Person'
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
