import ExpenseAdapter from '../../src/adapters/ExpenseAdapter'
import { Debtor, Expense, OfflinePerson, User } from '../../src/models'
import {
  DBExpense,
  DBPerson,
  DBRelShouldPay,
  GExpense
} from '../../src/typeDefs'

const date = new Date()

const dbExpense: DBExpense = {
  id: 'test-id',
  name: 'test-name',
  timestamp: date.toISOString(),
  totalAmount: 90
}

const payer: DBPerson = {
  id: 'person-id',
  name: 'person-name'
}

const debtorPersons: DBPerson[] = [
  {
    id: 'user-id',
    name: 'user-name',
    email: 'user-email',
    passwordHash: 'user-pass-hash'
  }
]

const debtAmounts: DBRelShouldPay[] = [
  {
    amount: 90
  }
]

const expense: Expense = new Expense(
  'test-id',
  'test-name',
  date,
  103,
  new User('user-id', 'user-name', 'user-email', 'user-pass-hash'),
  [new Debtor(new OfflinePerson('op-id', 'op-name'), 103)]
)

describe('ExpenseAdapter', () => {
  test('toExpenseModel', () => {
    const expenseModel = ExpenseAdapter.toExpenseModel(
      dbExpense,
      payer,
      debtorPersons,
      debtAmounts
    )

    expect(expenseModel.id).toBe('test-id')
    expect(expenseModel.name).toBe('test-name')
    expect(expenseModel.timestamp).toEqual(date)
    expect(expenseModel.totalAmount).toBe(90)
    expect(expenseModel.payer).toEqual(
      new OfflinePerson('person-id', 'person-name')
    )
    expect(expenseModel.debtors).toEqual([
      new Debtor(
        new User('user-id', 'user-name', 'user-email', 'user-pass-hash'),
        90
      )
    ])
  })

  test('toGExpense', () => {
    const gExpense = ExpenseAdapter.toGExpense(expense)

    expect(gExpense).toEqual<GExpense>({
      id: 'test-id',
      name: 'test-name',
      timestamp: date.toISOString(),
      totalAmount: 103,
      payer: {
        id: 'user-id',
        username: 'user-name',
        email: 'user-email'
      },
      debtors: [
        {
          person: {
            id: 'op-id',
            name: 'op-name'
          },
          amount: 103
        }
      ]
    })
  })
})
