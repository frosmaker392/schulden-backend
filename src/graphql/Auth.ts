import { extendType, nonNull, objectType, stringArg, unionType } from 'nexus'

export const AuthSuccess = objectType({
  name: 'AuthSuccess',
  definition(t) {
    t.nonNull.string('token')
    t.nonNull.field('user', {
      type: 'User'
    })
  }
})

export const AuthFailure = objectType({
  name: 'AuthFailure',
  definition(t) {
    t.nonNull.string('reason')
  }
})

export const AuthPayload = unionType({
  name: 'AuthPayload',
  resolveType(data) {
    const __typename = 'token' in data ? 'AuthSuccess' : 'AuthFailure'

    return __typename
  },
  definition(t) {
    t.members('AuthSuccess', 'AuthFailure')
  }
})

export const AuthMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context) {
        return context.services.auth.login(args)
      }
    })

    t.nonNull.field('register', {
      type: 'AuthPayload',
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
