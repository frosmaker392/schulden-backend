import {
  extendType,
  interfaceType,
  nonNull,
  objectType,
  stringArg,
  unionType
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

export const OfflinePerson = objectType({
  name: 'OfflinePerson',
  definition(t) {
    t.implements('Person')
  }
})

export const Persons = objectType({
  name: 'Persons',
  definition(t) {
    t.nonNull.list.nonNull.field('persons', { type: 'Person' })
  }
})

export const PersonsResult = unionType({
  name: 'PersonsResult',
  resolveType(data) {
    const __typename = 'errorMessage' in data ? 'Error' : 'Persons'

    return __typename
  },
  definition(t) {
    t.members('Persons', 'Error')
  }
})

export const PersonQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('findPersons', {
      type: 'PersonsResult',
      args: {
        name: nonNull(stringArg())
      },
      async resolve(parent, { name }, context) {
        return context.services.expense.findPersons(name, context.userId)
      }
    })
  }
})
