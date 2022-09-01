import { ApolloError, ForbiddenError, UserInputError } from 'apollo-server'
import ExpenseAdapter from '../adapters/ExpenseAdapter'
import { ExpenseDao, ExpenseForm } from '../daos/ExpenseDao'
import { OfflinePersonDao } from '../daos/OfflinePersonDao'
import { UserDao } from '../daos/UserDao'
import { GExpense } from '../typeDefs'

export default class ExpenseService {
  constructor(
    private expenseDao: ExpenseDao,
    private userDao: UserDao,
    private offlinePersonDao: OfflinePersonDao
  ) {}

  async createExpense(
    expenseForm: ExpenseForm,
    actorId?: string
  ): Promise<GExpense> {
    if (!actorId) throw new ForbiddenError('Unauthorized!')
    const offlinePersons = await this.offlinePersonDao.getAll(actorId)

    const allIds = [
      ...expenseForm.debtors.map((d) => d.personId),
      expenseForm.payerId
    ]

    // Validate all ids before creating expense
    for (const id of allIds) {
      if (
        !offlinePersons.some((o) => o.id === id) &&
        !(await this.userDao.getById(id))
      )
        throw new UserInputError('Ids are invalid!')
    }

    const createdExpense = await this.expenseDao.create(expenseForm, actorId)

    return ExpenseAdapter.toGExpense(createdExpense)
  }

  async getAllExpenses(userId?: string): Promise<GExpense[]> {
    if (!userId) throw new ForbiddenError('Unauthorized!')

    const expenses = await this.expenseDao.getAll(userId, userId)
    return expenses.map((e) => ExpenseAdapter.toGExpense(e))
  }

  async getAllRelatedExpenses(
    personId: string,
    actorId?: string
  ): Promise<GExpense[]> {
    if (!actorId) throw new ForbiddenError('Unauthorized!')

    const expenses = await this.expenseDao.getAll(personId, actorId)
    return expenses.map((e) => ExpenseAdapter.toGExpense(e))
  }

  async getExpenseById(expenseId: string, actorId?: string): Promise<GExpense> {
    if (!actorId) throw new ForbiddenError('Unauthorized!')

    const expense = await this.expenseDao.getById(expenseId, actorId)
    if (!expense)
      throw new UserInputError(`Expense with ID "${expenseId}" not found!`)

    return ExpenseAdapter.toGExpense(expense)
  }

  async deleteExpense(expenseId: string, actorId?: string): Promise<GExpense> {
    console.log(actorId)
    if (!actorId) throw new ForbiddenError('Unauthorized!')

    const deletedExpense = await this.expenseDao.deleteById(expenseId, actorId)
    if (!deletedExpense)
      throw new ApolloError(`Unable to delete expense with ID "${expenseId}"!`)

    return ExpenseAdapter.toGExpense(deletedExpense)
  }
}
