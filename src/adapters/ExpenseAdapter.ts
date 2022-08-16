import { Debtor, Expense, Person } from '../models'
import { DBExpense, DBPerson, DBRelShouldPay, GExpense } from '../typeDefs'
import PersonAdapter from './PersonAdapter'

export default class ExpenseAdapter {
  static toExpenseModel(
    from: DBExpense,
    payer: DBPerson,
    debtorPersons: DBPerson[],
    debtAmounts: DBRelShouldPay[]
  ): Expense {
    const debtors = debtorPersons.map((d, i) => {
      const person: Person = PersonAdapter.toPersonModel(d)

      return new Debtor(person, debtAmounts[i].amount)
    })

    return new Expense(
      from.id,
      from.name,
      new Date(from.timestamp),
      from.totalAmount,
      PersonAdapter.toPersonModel(payer),
      debtors
    )
  }

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
