import { extendType, objectType } from 'nexus'
import { NexusGenObjects } from '../../nexus-typegen'

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id")
    t.nonNull.string("email")
    t.nonNull.string("username")
    t.nonNull.string("passHash")
  }
})

let users: NexusGenObjects["User"][] = [
  {
    id: 1,
    email: "test@test.com",
    username: "test",
    passHash: "test-hash",
  },
]

export const UserQuery = extendType({ 
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("users", {
      type: "User",
      resolve(parent, args, context, info) {
        return users
      }
    })
  }
})