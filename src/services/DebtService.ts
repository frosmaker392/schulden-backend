import { ForbiddenError } from 'apollo-server'
import PersonAdapter from '../adapters/PersonAdapter'
import { DebtDao } from '../daos/DebtDao'
import { GDebtor, GDebtSummary } from '../typeDefs'

export default class DebtService {
  constructor(private debtDao: DebtDao) {}

  async getAllDebts(actorId?: string): Promise<GDebtor[]> {
    if (!actorId) throw new ForbiddenError('Unauthorized')

    const debts = await this.debtDao.getAll(actorId)
    return debts.map((d) => ({
      person: PersonAdapter.toGPerson(d.person),
      amount: d.amount
    }))
  }

  async getDebtSummary(actorId?: string): Promise<GDebtSummary> {
    if (!actorId) throw new ForbiddenError('Unauthorized')

    const debts = await this.debtDao.getAll(actorId)
    const totalAmount = debts.reduce((acc, d) => acc + d.amount, 0)
    return {
      totalAmount,
      topDebtors: debts.slice(0, 3)
    }
  }
}
