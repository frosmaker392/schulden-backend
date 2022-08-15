import { OfflinePerson, Person, User } from '../models'
import { DBPerson, DBUser, GPerson, GUser } from '../typeDefs'

export default class PersonAdapter {
  static toGUser(from: User): GUser {
    return {
      id: from.id,
      email: from.email,
      username: from.name
    }
  }

  static toGPerson(from: Person): GPerson {
    if (from instanceof User)
      return {
        id: from.id,
        email: from.email,
        username: from.name
      }

    return {
      id: from.id,
      name: from.name
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
