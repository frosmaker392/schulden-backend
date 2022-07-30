import UserAdapter from '../../src/adapters/UserAdapter'
import { UserDao, UserMemoryDao } from '../../src/daos/UserDao'
import AccountService from '../../src/services/AccountService'
import { GError, GUser, User } from '../../src/typeDefs'

const usersToCreate: Omit<User, 'id'>[] = [
  {
    name: 'testUser1',
    email: 'testUser1@email.com',
    passwordHash: 'testUser1Hash'
  },
  {
    name: 'testUser2',
    email: 'testUser2@email.com',
    passwordHash: 'testUser2Hash'
  },
  {
    name: 'testUser3',
    email: 'testUser3@email.com',
    passwordHash: 'testUser3Hash'
  }
]

let userDao: UserDao
let accountService: AccountService
let createdUsers: User[]
describe('AccountService', () => {
  beforeEach(async () => {
    userDao = new UserMemoryDao()
    createdUsers = await Promise.all(
      usersToCreate.map(async (u) => await userDao.create(u))
    )

    accountService = new AccountService(userDao)
  })

  describe('getAll', () => {
    test('returns all available users', async () => {
      const users = await accountService.getAll()

      expect(users).toEqual<GUser[]>([
        {
          id: expect.any(String),
          username: 'testUser1',
          email: 'testUser1@email.com'
        },
        {
          id: expect.any(String),
          username: 'testUser2',
          email: 'testUser2@email.com'
        },
        {
          id: expect.any(String),
          username: 'testUser3',
          email: 'testUser3@email.com'
        }
      ])
    })
  })

  describe('user', () => {
    test('returns user if available', async () => {
      const user = await accountService.getUser(createdUsers[0].id)

      expect(user).toEqual<GUser>(UserAdapter.toGUser(createdUsers[0]))
    })

    test('returns undefined if not available or no user id given', async () => {
      const user = await accountService.getUser('non-existent-id')

      expect(user).toBeUndefined()
      expect(await accountService.getUser()).toBeUndefined()
    })
  })

  describe('update', () => {
    test('returns updated user if actorID matches', async () => {
      const result = await accountService.update(
        {
          id: createdUsers[0].id,
          username: 'anotherUsername'
        },
        createdUsers[0].id
      )

      expect(result).toEqual<GUser>({
        id: createdUsers[0].id,
        email: createdUsers[0].email,
        username: 'anotherUsername'
      })
    })

    test('can update password', async () => {
      const result = await accountService.update(
        {
          id: createdUsers[0].id,
          username: 'anotherUsername',
          password: 'anotherPassword'
        },
        createdUsers[0].id
      )

      expect(result).toEqual<GUser>({
        id: createdUsers[0].id,
        email: createdUsers[0].email,
        username: 'anotherUsername'
      })
      expect(
        (await userDao.getUnique('id', createdUsers[0].id))?.passwordHash
      ).not.toBe(createdUsers[0].passwordHash)
    })

    test('returns "Unauthorized" error if actorID does not match', async () => {
      const result = await accountService.update(
        {
          id: createdUsers[0].id,
          username: 'anotherUsername',
          password: 'anotherPassword'
        },
        createdUsers[1].id
      )

      expect(result).toEqual<GError>({
        errorMessage: 'Unauthorized'
      })
      expect(
        (await userDao.getUnique('id', createdUsers[0].id))?.passwordHash
      ).toBe(createdUsers[0].passwordHash)
    })

    test('returns error if no user found with matching ID', async () => {
      const result = await accountService.update(
        {
          id: 'non-existent-id',
          username: 'anotherUsername',
          password: 'anotherPassword'
        },
        createdUsers[0].id
      )

      expect(result).toEqual<GError>({
        errorMessage: expect.any(String)
      })
    })
  })
})
