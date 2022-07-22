import UserAdapter from '../../src/adapters/UserAdapter'
import { GUser, User } from '../../src/typeDefs'

describe('UserAdapter', () => {
  test('toGUser transforms User object to GUser', () => {
    const user: User = {
      id: 'testid',
      name: 'testUser',
      email: 'testUser@test.com',
      passwordHash: 'test-user-hash'
    }
    const userAdapter: UserAdapter = new UserAdapter()

    expect(userAdapter.toGUser(user)).toEqual<GUser>({
      id: user.id,
      username: user.name,
      email: user.email
    })
  })
})
