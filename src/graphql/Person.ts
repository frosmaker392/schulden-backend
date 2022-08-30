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
    t.nonNull.field('getPerson', {
      type: 'Person',
      args: {
        id: nonNull(stringArg())
      },
      async resolve(parent, { id }, context) {
        return context.services.person.getPerson(id, context.userId)
      }
    })

    t.nonNull.list.nonNull.field('findPersons', {
      type: 'Person',
      args: {
        name: nonNull(stringArg())
      },
      async resolve(parent, { name }, context) {
        return context.services.person.findPersons(name, context.userId)
      }
    })
  }
})

export const PersonMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createOfflinePerson', {
      type: 'OfflinePerson',
      args: {
        name: nonNull(stringArg())
      },
      async resolve(parent, { name }, context) {
        return context.services.person.createOfflinePerson(name, context.userId)
      }
    })
  }
})
