import { extendType, nonNull, objectType, stringArg, unionType } from 'nexus'

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.nonNull.string('token')
    t.nonNull.field('user', {
      type: 'User'
    })
  }
})

export const AuthResult = unionType({
  name: 'AuthResult',
  resolveType(data) {
    const __typename = 'token' in data ? 'AuthPayload' : 'Error'

    return __typename
  },
  definition(t) {
    t.members('AuthPayload', 'Error')
  }
})

export const AuthMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('login', {
      type: 'AuthResult',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context) {
        return context.services.auth.login(args)
      }
    })

    t.nonNull.field('register', {
      type: 'AuthResult',
      args: {
        username: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context) {
        return context.services.auth.register(args)
      }
    })
  }
})
