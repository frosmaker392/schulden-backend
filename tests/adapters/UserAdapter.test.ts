import UserAdapter from '../../src/adapters/UserAdapter'
import { User } from '../../src/models/Person'
import { DBUser, GUser } from '../../src/typeDefs'

describe('UserAdapter', () => {
  test('toGUser - transforms User object to GUser', () => {
    const user: User = new User(
      'testid',
      'testUser',
      'testUser@test.com',
      'test-user-hash'
    )

    expect(UserAdapter.toGUser(user)).toEqual<GUser>({
      id: user.id,
      username: user.name,
      email: user.email
    })
  })

  test('toUserModel - transforms DBUser object to User model', () => {
    const dbUser: DBUser = {
      id: 'testid',
      name: 'testUser',
      email: 'testUser@test.com',
      passwordHash: 'test-user-hash'
    }

    const user = UserAdapter.toUserModel(dbUser)

    expect(user.id).toBe(dbUser.id)
    expect(user.name).toBe(dbUser.name)
    expect(user.email).toBe(dbUser.email)
    expect(user.passwordHash).toBe(dbUser.passwordHash)
  })
})
