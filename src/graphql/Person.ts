import { interfaceType, objectType } from 'nexus'

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
