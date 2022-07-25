import { User } from '../../src/typeDefs'
import { UserMemoryDao } from '../../src/daos/UserDao'

const testUsers: User[] = [
  {
    id: 'test-id-1',
    email: 'userA@test.com',
    name: 'userA',
    passwordHash: 'userA-hash'
  },
  {
    id: 'test-id-2',
    email: 'userB@test.com',
    name: 'userB',
    passwordHash: 'userB-hash'
  },
  {
    id: 'test-id-2',
    email: 'userB@test.com',
    name: 'userB',
    passwordHash: 'userB-hash'
  },
  {
    id: 'test-id-3',
    email: 'userC@test.com',
    name: 'userC',
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
    expect(user.name).toBe(testUsers[0].name)
    expect(user.passwordHash).toBe(testUsers[0].passwordHash)
  })

  describe('getAll', () => {
    test('returns empty upon initialization', async () => {
      expect(await userDao.getAll()).toHaveLength(0)
    })

    test('returns correct list of all users', async () => {
      for (const testUser of testUsers) await userDao.create(testUser)

      const users = await userDao.getAll()

      expect(users).toHaveLength(4)
      expect(users[0].name).toBe(testUsers[0].name)
      expect(users[1].name).toBe(testUsers[1].name)
      expect(users[2].name).toBe(testUsers[2].name)
    })
  })

  let createdUsers: User[]
  describe('getMany', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        testUsers.map(async (testUser) => await userDao.create(testUser))
      )
    })

    test('returns correct users', async () => {
      const users = await userDao.getMany('email', createdUsers[1].email)

      expect(users).toEqual([createdUsers[1], createdUsers[2]])
    })

    test('returns empty array if no user is found', async () => {
      const user = await userDao.getMany('email', 'non-existent-email')

      expect(user).toHaveLength(0)
    })
  })

  describe('getUnique', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        testUsers.map(async (testUser) => await userDao.create(testUser))
      )
    })

    test('returns correct user by email', async () => {
      const user = await userDao.getUnique('email', createdUsers[0].email)

      expect(user).toEqual(createdUsers[0])
    })

    test('returns undefined if no user is found', async () => {
      const user = await userDao.getUnique('email', 'non-existent-email')

      expect(user).toBeUndefined()
    })
  })

  describe('getManyByNameAndEmail', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        testUsers.map(async (testUser) => await userDao.create(testUser))
      )
    })

    test('returns correct users', async () => {
      const users = await userDao.getManyByNameOrEmail(
        createdUsers[1].name,
        createdUsers[0].email
      )

      expect(users).toEqual([createdUsers[0], createdUsers[1], createdUsers[2]])
    })

    test('returns empty array if no user is found', async () => {
      const user = await userDao.getManyByNameOrEmail(
        'non-existent-name',
        'non-existent-email'
      )

      expect(user).toEqual([])
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
        name: 'updatedUserA'
      })

      expect(updatedUser?.name).toBe('updatedUserA')
      expect((await userDao.getUnique('id', createdUsers[0].id))?.name).toBe(
        'updatedUserA'
      )
    })

    test('returns undefined if no user is found', async () => {
      const updatedUser = await userDao.update({
        id: 'non-existent-id',
        name: 'updatedUsername'
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
      expect(await userDao.getAll()).toHaveLength(3)
      expect(await userDao.getUnique('id', createdUsers[1].id)).toBeUndefined()
    })

    test('returns undefined if no user is found', async () => {
      const deletedUser = await userDao.deleteById('non-existent-id')

      expect(deletedUser).toBeUndefined()
      expect(await userDao.getAll()).toHaveLength(4)
    })
  })
})
