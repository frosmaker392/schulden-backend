import { ExpenseForm, ExpenseMemoryDao } from '../../src/daos/ExpenseDao'
import { UserDao, UserMemoryDao } from '../../src/daos/UserDao'
import { Debtor } from '../../src/models/Debt'
import { Expense } from '../../src/models/Expense'
import { User } from '../../src/models/Person'

const usersToCreate: Omit<User, 'id'>[] = [
  {
    email: 'userA@test.com',
    name: 'userA',
    passwordHash: 'userA-hash'
  },
  {
    email: 'userB@test.com',
    name: 'userB',
    passwordHash: 'userB-hash'
  },
  {
    email: 'userC@test.com',
    name: 'userC',
    passwordHash: 'userC-hash'
  }
]

let userDao: UserDao, expenseDao: ExpenseMemoryDao, createdUsers: User[]

describe('ExpenseMemoryDao', () => {
  beforeEach(async () => {
    userDao = new UserMemoryDao()
    createdUsers = await Promise.all(
      usersToCreate.map((u) => userDao.create(u))
    )

    expenseDao = new ExpenseMemoryDao(userDao)
  })

  describe('create', () => {
    test('returns created expense if successful', async () => {
      const expenseForm: ExpenseForm = {
        name: 'test-expense',
        totalAmount: 50,
        payerId: createdUsers[0].id,
        debtors: [
          { personId: createdUsers[0].id, amount: 10 },
          { personId: createdUsers[1].id, amount: 20 },
          { personId: createdUsers[2].id, amount: 20 }
        ]
      }

      const createdExpense = await expenseDao.create(expenseForm)

      expect(createdExpense.id).toEqual(expect.any(String))
      expect(createdExpense.name).toBe(expenseForm.name)
      expect(createdExpense.totalAmount).toBe(expenseForm.totalAmount)
      expect(createdExpense.timestamp).toEqual(expect.any(Date))
      expect(createdExpense.payer).toEqual(createdUsers[0])
      expect(createdExpense.debtors).toEqual([
        new Debtor(createdUsers[0], 10),
        new Debtor(createdUsers[1], 20),
        new Debtor(createdUsers[2], 20)
      ])
    })

    test('fails if no id matches any existing users', () => {
      const expenseFormInvalidPayer: ExpenseForm = {
        name: 'test-expense',
        totalAmount: 50,
        payerId: 'non-existent-id',
        debtors: []
      }

      const expenseFormInvalidDebtors: ExpenseForm = {
        name: 'test-expense',
        totalAmount: 50,
        payerId: createdUsers[0].id,
        debtors: [
          { personId: createdUsers[1].id, amount: 10 },
          { personId: 'non-existent-id', amount: 40 }
        ]
      }

      expect(expenseDao.create(expenseFormInvalidPayer)).rejects.toEqual(
        expect.any(Error)
      )
      expect(expenseDao.create(expenseFormInvalidDebtors)).rejects.toEqual(
        expect.any(Error)
      )
    })
  })

  let createdExpenses: Expense[]
  describe('with valid create function', () => {
    beforeEach(async () => {
      const expenseForms: ExpenseForm[] = [
        {
          name: 'Expense 1',
          totalAmount: 10,
          payerId: createdUsers[0].id,
          debtors: [
            { personId: createdUsers[0].id, amount: 5 },
            { personId: createdUsers[1].id, amount: 5 }
          ]
        },
        {
          name: 'Expense 2',
          totalAmount: 20,
          payerId: createdUsers[1].id,
          debtors: [
            { personId: createdUsers[1].id, amount: 10 },
            { personId: createdUsers[2].id, amount: 10 }
          ]
        },
        {
          name: 'Expense 3',
          totalAmount: 10,
          payerId: createdUsers[2].id,
          debtors: [
            { personId: createdUsers[0].id, amount: 5 },
            { personId: createdUsers[1].id, amount: 5 }
          ]
        }
      ]

      createdExpenses = await Promise.all(
        expenseForms.map((e) => expenseDao.create(e))
      )
    })

    test('getAll - returns all expenses related to user with given id', async () => {
      const expensesUser0 = await expenseDao.getAll(createdUsers[0].id)
      const expensesUser1 = await expenseDao.getAll(createdUsers[1].id)
      const expensesUser2 = await expenseDao.getAll(createdUsers[2].id)

      expect(expensesUser0).toEqual([createdExpenses[0], createdExpenses[2]])
      expect(expensesUser1).toEqual(createdExpenses)
      expect(expensesUser2).toEqual([createdExpenses[1], createdExpenses[2]])
    })

    describe('deleteById', () => {
      test('deletes expense which has given id', async () => {
        const deletedExpense = await expenseDao.deleteById(
          createdExpenses[1].id
        )

        expect(deletedExpense).toEqual(createdExpenses[1])
      })

      test('returns undefined if expense id does not exist', async () => {
        const deletedExpense = await expenseDao.deleteById('non-existent-id')

        expect(deletedExpense).toBeUndefined()
      })
    })
  })
})
