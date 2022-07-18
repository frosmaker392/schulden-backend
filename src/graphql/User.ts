import { extendType, objectType } from 'nexus'
import { NexusGenObjects } from '../../nexus-typegen'

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("email")
    t.nonNull.string("username")
  }
})

export const UserQuery = extendType({ 
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("users", {
      type: "User",
      resolve(parent, args, context, info) {
        return context.userDao.getAll()
      }
    })
  }
})