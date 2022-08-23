import { extendType, objectType, unionType } from 'nexus'

export const Debtor = objectType({
  name: 'Debtor',
  definition(t) {
    t.nonNull.field('person', { type: 'Person' })
    t.nonNull.float('amount')
  }
})

export const Debtors = objectType({
  name: 'Debtors',
  definition(t) {
    t.nonNull.list.nonNull.field('debtors', { type: 'Debtor' })
  }
})

export const DebtSummary = objectType({
  name: 'DebtSummary',
  definition(t) {
    t.nonNull.float('totalAmount')
    t.nonNull.list.nonNull.field('topDebtors', { type: 'Debtor' })
  }
})

export const DebtorsResult = unionType({
  name: 'DebtorsResult',
  resolveType(data) {
    const __typename = 'errorMessage' in data ? 'Error' : 'Debtors'

    return __typename
  },
  definition(t) {
    t.members('Debtors', 'Error')
  }
})

export const DebtSummaryResult = unionType({
  name: 'DebtSummaryResult',
  resolveType(data) {
    const __typename = 'errorMessage' in data ? 'Error' : 'DebtSummary'

    return __typename
  },
  definition(t) {
    t.members('DebtSummary', 'Error')
  }
})

export const DebtQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getAllDebts', {
      type: 'DebtorsResult',
      resolve(parent, args, context) {
        return context.services.debt.getAllDebts(context.userId)
      }
    })

    t.nonNull.field('getDebtSummary', {
      type: 'DebtSummaryResult',
      resolve(parent, args, context) {
        return context.services.debt.getDebtSummary(context.userId)
      }
    })
  }
})
