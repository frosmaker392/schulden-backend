import ExpenseAdapter from '../adapters/ExpenseAdapter'
import { ExpenseDao, ExpenseForm } from '../daos/ExpenseDao'
import { OfflinePersonDao } from '../daos/OfflinePersonDao'
import { UserDao } from '../daos/UserDao'
import { GExpenseResult, GExpensesResult, GPersonsResult } from '../typeDefs'

export default class ExpenseService {
  constructor(
    private expenseDao: ExpenseDao,
    private userDao: UserDao,
    private offlinePersonDao: OfflinePersonDao
  ) {}

  async createExpense(
    expenseForm: ExpenseForm,
    actorId?: string
  ): Promise<GExpenseResult> {
    if (!actorId) return { errorMessage: 'Unauthorized!' }
    const offlinePersons = await this.offlinePersonDao.getAll(actorId)

    const allIds = [
      ...expenseForm.debtors.map((d) => d.personId),
      expenseForm.payerId
    ]

    // Validate all ids before creating expense
    for (const id of allIds) {
      if (
        !offlinePersons.some((o) => o.id === id) &&
        !(await this.userDao.getUniqueById(id))
      )
        return { errorMessage: 'Ids are invalid!' }
    }

    const createdExpense = await this.expenseDao.create(expenseForm, actorId)

    return ExpenseAdapter.toGExpense(createdExpense)
  }

  async getAllExpenses(userId?: string): Promise<GExpensesResult> {
    if (!userId) return { errorMessage: 'Unauthorized!' }

    const expenses = await this.expenseDao.getAll(userId, userId)
    return {
      expenses: expenses.map((e) => ExpenseAdapter.toGExpense(e))
    }
  }

  async getAllRelatedExpenses(
    personId: string,
    actorId?: string
  ): Promise<GExpensesResult> {
    if (!actorId) return { errorMessage: 'Unauthorized!' }

    const expenses = await this.expenseDao.getAll(personId, actorId)
    return {
      expenses: expenses.map((e) => ExpenseAdapter.toGExpense(e))
    }
  }

  async getExpenseById(
    expenseId: string,
    actorId?: string
  ): Promise<GExpenseResult> {
    if (!actorId) return { errorMessage: 'Unauthorized!' }

    const expense = await this.expenseDao.getById(expenseId, actorId)
    if (!expense)
      return { errorMessage: `Expense with ID "${expenseId}" not found!` }

    return ExpenseAdapter.toGExpense(expense)
  }

  async deleteExpense(
    expenseId: string,
    actorId?: string
  ): Promise<GExpenseResult> {
    console.log(actorId)
    if (!actorId) return { errorMessage: 'Unauthorized!' }

    const deletedExpense = await this.expenseDao.deleteById(expenseId, actorId)
    if (!deletedExpense)
      return {
        errorMessage: `Unable to delete expense with ID "${expenseId}"!`
      }

    return ExpenseAdapter.toGExpense(deletedExpense)
  }

  async findPersons(name: string, actorId?: string): Promise<GPersonsResult> {
    if (!actorId) return { errorMessage: 'Unauthorized!' }

    const users = name.length ? await this.userDao.findByName(name) : []
    const offlinePersons = await this.offlinePersonDao.getAll(actorId)

    return {
      persons: [
        ...users,
        ...offlinePersons.filter((p) => p.name.match(new RegExp(name)))
      ]
    }
  }
}
