import PersonAdapter from '../adapters/PersonAdapter'
import { DebtDao } from '../daos/DebtDao'
import { GDebtorsResult, GDebtSummaryResult } from '../typeDefs'

export default class DebtService {
  constructor(private debtDao: DebtDao) {}

  async getAllDebts(actorId?: string): Promise<GDebtorsResult> {
    if (!actorId) return { errorMessage: 'Unauthorized!' }

    const debts = await this.debtDao.getAll(actorId)
    return {
      debtors: debts.map((d) => ({
        person: PersonAdapter.toGPerson(d.person),
        amount: d.amount
      }))
    }
  }

  async getDebtSummary(actorId?: string): Promise<GDebtSummaryResult> {
    if (!actorId) return { errorMessage: 'Unauthorized!' }

    const debts = await this.debtDao.getAll(actorId)
    const totalAmount = debts.reduce((acc, d) => acc + d.amount, 0)
    return {
      totalAmount,
      topDebtors: debts.slice(0, 3)
    }
  }
}
