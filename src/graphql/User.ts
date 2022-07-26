import { extendType, nonNull, objectType, stringArg, unionType } from 'nexus'
import ArgsAdapter from '../adapters/ArgsAdapter'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('email')
    t.nonNull.string('username')
  }
})

export const Users = objectType({
  name: 'Users',
  definition(t) {
    t.nonNull.list.nonNull.field('list', {
      type: 'User'
    })
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

export const UsersResult = unionType({
  name: 'UsersResult',
  resolveType(data) {
    const __typename = 'errorMessage' in data ? 'Error' : 'Users'
    return __typename
  },
  definition(t) {
    t.members('Users', 'Error')
  }
})

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('users', {
      type: 'User',
      resolve(parent, args, context) {
        return context.services.account.getAll()
      }
    })

    t.nonNull.field('updateUser', {
      type: 'UserResult',
      args: {
        id: nonNull(stringArg()),
        username: stringArg(),
        password: stringArg()
      },
      resolve(parent, args, context) {
        const actorID = context.userId
        const userToUpdate = ArgsAdapter.replaceNullsWithUndefineds(args)
        return context.services.account.update(userToUpdate, actorID)
      }
    })
  }
})
