import PersonAdapter from '../../src/adapters/PersonAdapter'
import { OfflinePerson, User } from '../../src/models/Person'
import { DBPerson, DBUser, GUser } from '../../src/typeDefs'

const testUser: DBUser = {
  id: 'testid',
  name: 'testUser',
  email: 'testUser@test.com',
  passwordHash: 'test-user-hash'
}

describe('PersonAdapter', () => {
  test('toGUser - transforms User object to GUser', () => {
    const user: User = new User(
      'testid',
      'testUser',
      'testUser@test.com',
      'test-user-hash'
    )

    expect(PersonAdapter.toGUser(user)).toEqual<GUser>({
      id: user.id,
      username: user.name,
      email: user.email
    })
  })

  test('toUserModel - transforms DBUser object to User model', () => {
    const dbUser: DBUser = testUser

    const user = PersonAdapter.toUserModel(dbUser)

    expect(user.id).toBe(dbUser.id)
    expect(user.name).toBe(dbUser.name)
    expect(user.email).toBe(dbUser.email)
    expect(user.passwordHash).toBe(dbUser.passwordHash)
  })

  describe('toPersonModel', () => {
    test('returns a User if the DBPerson contains corresponding user fields', () => {
      const dbPerson: DBPerson = testUser

      const person = PersonAdapter.toPersonModel(dbPerson)

      expect(person).toBeInstanceOf(User)
    })

    test('returns an OfflinePerson otherwise', () => {
      const dbPerson: DBPerson = {
        id: 'testid',
        name: 'testOfflinePerson'
      }

      const person = PersonAdapter.toPersonModel(dbPerson)

      expect(person).toBeInstanceOf(OfflinePerson)
    })
  })
})
