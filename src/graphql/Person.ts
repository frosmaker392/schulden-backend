import { objectType, unionType } from 'nexus'

export const OfflinePerson = objectType({
  name: 'OfflinePerson',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('name')
  }
})

export const Person = unionType({
  name: 'Person',
  resolveType(data) {
    const __typename = 'email' in data ? 'User' : 'OfflinePerson'

    return __typename
  },
  definition(t) {
    t.members('User', 'OfflinePerson')
  }
})
