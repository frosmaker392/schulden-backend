import { User, GUser } from '../typeDefs'

export default class UserAdapter {
  static toGUser(from: User): GUser {
    return {
      id: from.id,
      email: from.email,
      username: from.name
    }
  }
}
