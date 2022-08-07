import { User } from '../models/Person'
import { DBUser, GUser } from '../typeDefs'

export default class UserAdapter {
  static toGUser(from: User): GUser {
    return {
      id: from.id,
      email: from.email,
      username: from.name
    }
  }

  static toUserModel(from: DBUser): User {
    return new User(from.id, from.name, from.email, from.passwordHash)
  }
}
