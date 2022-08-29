import { extendType, nonNull, objectType, stringArg } from 'nexus'

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.nonNull.string('token')
    t.nonNull.field('user', {
      type: 'User'
    })
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

export const AuthQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('currentUser', {
      type: 'User',
      async resolve(parent, args, context) {
        return (await context.services.auth.getUser(context.userId)) ?? null
      }
    })
  }
})
