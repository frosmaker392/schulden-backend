import ExpenseAdapter from '../adapters/ExpenseAdapter'
import { ExpenseDao, ExpenseForm } from '../daos/ExpenseDao'
import { OfflinePersonDao } from '../daos/OfflinePersonDao'
import { UserDao } from '../daos/UserDao'
import { GExpenseResult, GExpensesResult } from '../typeDefs'

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

  async deleteExpense(
    expenseId: string,
    actorId?: string
  ): Promise<GExpenseResult> {
    if (!actorId) return { errorMessage: 'Unauthorized!' }

    const deletedExpense = await this.expenseDao.deleteById(expenseId)
    if (!deletedExpense)
      return { errorMessage: `Unable to delete expense with ID ${expenseId}` }

    return ExpenseAdapter.toGExpense(deletedExpense)
  }
}
