import { OfflinePerson, Person, User } from '../models'
import { DBPerson, DBUser, GUser } from '../typeDefs'

export default class PersonAdapter {
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

  static toPersonModel(from: DBPerson): Person {
    if ('email' in from) return this.toUserModel(from)
    return new OfflinePerson(from.id, from.name)
  }
}
