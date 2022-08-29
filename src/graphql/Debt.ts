import { extendType, objectType } from 'nexus'

export const Debtor = objectType({
  name: 'Debtor',
  definition(t) {
    t.nonNull.field('person', { type: 'Person' })
    t.nonNull.float('amount')
  }
})

export const DebtSummary = objectType({
  name: 'DebtSummary',
  definition(t) {
    t.nonNull.float('totalAmount')
    t.nonNull.list.nonNull.field('topDebtors', { type: 'Debtor' })
  }
})

export const DebtQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getAllDebts', {
      type: 'Debtor',
      resolve(parent, args, context) {
        return context.services.debt.getAllDebts(context.userId)
      }
    })

    t.nonNull.field('getDebtSummary', {
      type: 'DebtSummary',
      resolve(parent, args, context) {
        return context.services.debt.getDebtSummary(context.userId)
      }
    })
  }
})
