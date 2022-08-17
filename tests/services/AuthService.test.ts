import AuthService from '../../src/services/AuthService'
import { UserMemoryDao } from '../../src/daos/UserDao'
import { GError, GAuthPayload, GUser } from '../../src/typeDefs'
import { User } from '../../src/models/Person'

const existingUsersToCreate = [
  {
    email: 'user1@test.com',
    name: 'user1',
    passwordHash: 'user1-hash'
  },
  {
    email: 'user2@test.com',
    name: 'user2',
    passwordHash: 'user2-hash'
  }
]

const validRegisterForm = {
  email: 'user3@test.com',
  username: 'user3',
  password: 'User3-pass'
}

const validLoginForm = {
  email: 'user3@test.com',
  password: 'User3-pass'
}

let authService: AuthService
let createdUsers: User[]
describe('AuthService', () => {
  beforeEach(async () => {
    const userDao = new UserMemoryDao()
    createdUsers = await Promise.all(
      existingUsersToCreate.map((u) => userDao.create(u))
    )

    authService = new AuthService(userDao, 'secret')
  })

  const expectAnyError = (obj: unknown) =>
    expect(obj).toEqual<GError>({ errorMessage: expect.any(String) })

  describe('register', () => {
    test('success with a different email', async () => {
      const result = await authService.register(validRegisterForm)

      expect(result).toEqual<GAuthPayload>({
        token: expect.any(String),
        user: {
          id: expect.any(String),
          email: 'user3@test.com',
          name: 'user3'
        }
      })
    })

    test('failure if email is already present', async () => {
      const result = await authService.register({
        email: 'user1@test.com',
        username: 'abc123',
        password: 'User1-pass'
      })

      expectAnyError(result)
    })

    test('failure if username is already present', async () => {
      const result = await authService.register({
        email: 'user1@test.com',
        username: 'user1',
        password: 'User1-pass'
      })

      expectAnyError(result)
    })

    test('failure if email is invalid', async () => {
      const result = await authService.register({
        ...validRegisterForm,
        email: 'user3'
      })

      expectAnyError(result)
    })

    test('failure if username is invalid', async () => {
      const result = await authService.register({
        ...validRegisterForm,
        username: 'a'
      })

      expectAnyError(result)
    })

    test('failure if password is invalid', async () => {
      const result = await authService.register({
        ...validRegisterForm,
        password: 'password'
      })

      expectAnyError(result)
    })
  })

  describe('login', () => {
    test('success if email is already present', async () => {
      await authService.register(validRegisterForm)
      const result = await authService.login(validLoginForm)

      expect(result).toEqual<GAuthPayload>({
        token: expect.any(String),
        user: {
          id: expect.any(String),
          email: 'user3@test.com',
          name: 'user3'
        }
      })
    })

    test('failure if email is not present', async () => {
      const result = await authService.login(validLoginForm)

      expectAnyError(result)
    })

    test('failure if password is invalid', async () => {
      await authService.register(validRegisterForm)
      const result = await authService.login({
        ...validLoginForm,
        password: 'user3-pass'
      })

      expectAnyError(result)
    })
  })

  describe('getUser', () => {
    test('returns user if present', async () => {
      const user = await authService.getUser(createdUsers[0].id)

      expect(user).toEqual<GUser>({
        id: createdUsers[0].id,
        name: createdUsers[0].name,
        email: createdUsers[0].email
      })
    })

    test('returns undefined if not present', async () => {
      const user = await authService.getUser('non-existent-id')

      expect(user).toBeUndefined()
    })
  })
})
