import {
  extendType,
  floatArg,
  inputObjectType,
  list,
  nonNull,
  objectType,
  stringArg
} from 'nexus'
import { ExpenseForm } from '../daos/ExpenseDao'

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

export const DebtorInputType = inputObjectType({
  name: 'DebtorInputType',
  definition(t) {
    t.nonNull.string('personId'), t.nonNull.float('amount')
  }
})

export const ExpenseQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getAllExpenses', {
      type: 'Expense',
      async resolve(parent, args, context) {
        return context.services.expense.getAllExpenses(context.userId)
      }
    })

    t.nonNull.list.nonNull.field('getAllRelatedExpenses', {
      type: 'Expense',
      args: {
        personId: nonNull(stringArg())
      },
      async resolve(parent, { personId }, context) {
        return context.services.expense.getAllRelatedExpenses(
          personId,
          context.userId
        )
      }
    })

    t.nonNull.field('getExpense', {
      type: 'Expense',
      args: {
        expenseId: nonNull(stringArg())
      },
      async resolve(parent, { expenseId }, context) {
        return context.services.expense.getExpenseById(
          expenseId,
          context.userId
        )
      }
    })
  }
})

export const ExpenseMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createExpense', {
      type: 'Expense',
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

    t.nonNull.field('deleteExpense', {
      type: 'Expense',
      args: {
        expenseId: nonNull(stringArg())
      },
      async resolve(parent, { expenseId }, context) {
        return context.services.expense.deleteExpense(expenseId, context.userId)
      }
    })
  }
})
