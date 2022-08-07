import { extendType, objectType, unionType } from 'nexus'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('email')
    t.nonNull.string('username')
  }
})

export const UserResult = unionType({
  name: 'UserResult',
  resolveType(data) {
    const __typename = 'errorMessage' in data ? 'Error' : 'User'

    return __typename
  },
  definition(t) {
    t.members('User', 'Error')
  }
})

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('currentUser', {
      type: 'UserResult',
      async resolve(parent, args, context) {
        const id = context.userId
        if (!id)
          return {
            errorMessage: 'Unauthorized'
          }

        const user = await context.services.auth.getUser(id)
        if (!user)
          return {
            errorMessage: 'Internal error: User cannot be found'
          }

        return user
      }
    })
  }
})
