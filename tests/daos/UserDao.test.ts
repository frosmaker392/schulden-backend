import { User } from '../../src/CommonTypes'
import { UserMemoryDao } from '../../src/daos/UserDao'

const testUsers: User[] = [
  {
    id: 'test-id-1',
    email: 'userA@test.com',
    username: 'userA',
    passwordHash: 'userA-hash'
  },
  {
    id: 'test-id-2',
    email: 'userB@test.com',
    username: 'userB',
    passwordHash: 'userB-hash'
  },
  {
    id: 'test-id-3',
    email: 'userC@test.com',
    username: 'userC',
    passwordHash: 'userC-hash'
  }
]

let userDao: UserMemoryDao
describe('UserMemoryDao', () => {
  beforeEach(() => {
    userDao = new UserMemoryDao()
  })

  test('create - can create user', async () => {
    const user = await userDao.create(testUsers[0])

    expect(user.id).not.toBeUndefined()
    expect(user.id).not.toBe(testUsers[0].id)
    expect(user.email).toBe(testUsers[0].email)
    expect(user.username).toBe(testUsers[0].username)
    expect(user.passwordHash).toBe(testUsers[0].passwordHash)
  })

  describe('getAll', () => {
    test('returns empty upon initialization', async () => {
      expect(await userDao.getAll()).toHaveLength(0)
    })

    test('returns correct list of all users', async () => {
      for (const testUser of testUsers) await userDao.create(testUser)

      const users = await userDao.getAll()

      expect(users).toHaveLength(3)
      expect(users[0].username).toBe(testUsers[0].username)
      expect(users[1].username).toBe(testUsers[1].username)
      expect(users[2].username).toBe(testUsers[2].username)
    })
  })

  let createdUsers: User[]
  describe('getById', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        testUsers.map(async (testUser) => await userDao.create(testUser))
      )
    })

    test('returns correct user associated with id', async () => {
      const user = await userDao.getById(createdUsers[0].id)

      expect(user?.username).toBe(createdUsers[0].username)
    })

    test('returns undefined if no user is found', async () => {
      for (const testUser of testUsers) userDao.create(testUser)

      const user = await userDao.getById('non-existent-id')

      expect(user).toBeUndefined()
    })
  })

  describe('getByEmail', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        testUsers.map(async (testUser) => await userDao.create(testUser))
      )
    })

    test('returns correct user associated with email', async () => {
      const user = await userDao.getByEmail(createdUsers[0].email)

      expect(user?.username).toBe(createdUsers[0].username)
    })

    test('returns undefined if no user is found', async () => {
      for (const testUser of testUsers) userDao.create(testUser)

      const user = await userDao.getByEmail('non-existent-email')

      expect(user).toBeUndefined()
    })
  })

  describe('update', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        testUsers.map(async (testUser) => await userDao.create(testUser))
      )
    })

    test('returns updated user', async () => {
      const updatedUser = await userDao.update({
        id: createdUsers[0].id,
        username: 'updatedUserA'
      })

      expect(updatedUser?.username).toBe('updatedUserA')
      expect((await userDao.getById(createdUsers[0].id))?.username).toBe(
        'updatedUserA'
      )
    })

    test('returns undefined if no user is found', async () => {
      const updatedUser = await userDao.update({
        id: 'non-existent-id',
        username: 'updatedUsername'
      })

      expect(updatedUser).toBeUndefined()
    })
  })

  describe('deleteById', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        testUsers.map(async (testUser) => await userDao.create(testUser))
      )
    })

    test('returns deleted user', async () => {
      const deletedUser = await userDao.deleteById(createdUsers[1].id)

      expect(deletedUser).toEqual(createdUsers[1])
      expect(await userDao.getAll()).toHaveLength(2)
      expect(await userDao.getById(createdUsers[1].id)).toBeUndefined()
    })

    test('returns undefined if no user is found', async () => {
      const deletedUser = await userDao.deleteById('non-existent-id')

      expect(deletedUser).toBeUndefined()
      expect(await userDao.getAll()).toHaveLength(3)
    })
  })
})
