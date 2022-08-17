import { OfflinePerson, Person, User } from '../models'
import { DBPerson, DBUser, GPerson, GUser } from '../typeDefs'

export default class PersonAdapter {
  static toGUser(from: User): GUser {
    const { id, name, email } = from
    return {
      id,
      name,
      email
    }
  }

  static toGPerson(from: Person): GPerson {
    if (from instanceof User) {
      const { id, name, email } = from
      return {
        id,
        name,
        email
      }
    }

    return {
      id: from.id,
      name: from.name
    }
  }

  static toUserModel(from: DBUser): User {
    const { id, name, email, passwordHash } = from
    return new User(id, name, email, passwordHash)
  }

  static toPersonModel(from: DBPerson): Person {
    if ('email' in from) return this.toUserModel(from)
    return new OfflinePerson(from.id, from.name)
  }
}
