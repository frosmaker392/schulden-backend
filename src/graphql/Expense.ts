import {
  extendType,
  floatArg,
  inputObjectType,
  list,
  nonNull,
  objectType,
  stringArg,
  unionType
} from 'nexus'
import { ExpenseForm } from '../daos/ExpenseDao'

export const Debtor = objectType({
  name: 'Debtor',
  definition(t) {
    t.nonNull.field('person', { type: 'Person' })
    t.nonNull.float('amount')
  }
})

export const Expense = objectType({
  name: 'Expense',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('name')
    t.nonNull.string('timestamp')
    t.nonNull.float('totalAmount')
    t.nonNull.field('payer', { type: 'Person' })
    t.nonNull.list.nonNull.field('debtors', { type: 'Debtor' })
  }
})

export const Expenses = objectType({
  name: 'Expenses',
  definition(t) {
    t.nonNull.list.nonNull.field('expenses', { type: 'Expense' })
  }
})

export const ExpenseResult = unionType({
  name: 'ExpenseResult',
  resolveType(data) {
    const __typename = 'errorMessage' in data ? 'Error' : 'Expense'

    return __typename
  },
  definition(t) {
    t.members('Expense', 'Error')
  }
})

export const ExpensesResult = unionType({
  name: 'ExpensesResult',
  resolveType(data) {
    const __typename = 'errorMessage' in data ? 'Error' : 'Expenses'

    return __typename
  },
  definition(t) {
    t.members('Expenses', 'Error')
  }
})

export const DebtorInputType = inputObjectType({
  name: 'DebtorInputType',
  definition(t) {
    t.nonNull.string('personId'), t.nonNull.float('amount')
  }
})

export const ExpenseQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getAllExpenses', {
      type: 'ExpensesResult',
      args: {
        personId: nonNull(stringArg())
      },

      async resolve(parent, { personId }, context) {
        return context.services.expense.getAllExpenses(personId, context.userId)
      }
    })
  }
})

export const ExpenseMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createExpense', {
      type: 'ExpenseResult',
      args: {
        name: nonNull(stringArg()),
        totalAmount: nonNull(floatArg()),
        payerId: nonNull(stringArg()),
        debtors: nonNull(list(nonNull(DebtorInputType)))
      },

      async resolve(parent, args, context) {
        const expenseForm: ExpenseForm = args
        return context.services.expense.createExpense(
          expenseForm,
          context.userId
        )
      }
    })
  }
})
