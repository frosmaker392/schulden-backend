import { Expense } from '../models'
import { GExpense } from '../typeDefs'
import PersonAdapter from './PersonAdapter'

export default class ExpenseAdapter {
  static toGExpense(from: Expense): GExpense {
    return {
      id: from.id,
      name: from.name,
      timestamp: from.timestamp.toISOString(),
      totalAmount: from.totalAmount,
      payer: PersonAdapter.toGPerson(from.payer),
      debtors: from.debtors.map(({ person, amount }) => ({
        person: PersonAdapter.toGPerson(person),
        amount
      }))
    }
  }
}
