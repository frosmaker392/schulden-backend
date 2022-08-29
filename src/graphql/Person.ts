import {
  extendType,
  interfaceType,
  nonNull,
  objectType,
  stringArg
} from 'nexus'

export const Person = interfaceType({
  name: 'Person',
  resolveType(data) {
    const __typename = 'email' in data ? 'User' : 'OfflinePerson'

    return __typename
  },
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.string('name')
  }
})

export const User = objectType({
  name: 'User',
  definition(t) {
    t.implements('Person')
    t.nonNull.string('email')
  }
})

export const OfflinePerson = objectType({
  name: 'OfflinePerson',
  definition(t) {
    t.implements('Person')
  }
})

export const PersonQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('findPersons', {
      type: 'Person',
      args: {
        name: nonNull(stringArg())
      },
      async resolve(parent, { name }, context) {
        return context.services.expense.findPersons(name, context.userId)
      }
    })
  }
})
