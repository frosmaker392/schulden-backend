import { UserMemoryDao } from '../../src/daos/UserDao'
import { User } from '../../src/models/Person'

const usersToCreate: Omit<User, 'id'>[] = [
  {
    email: 'userA@test.com',
    name: 'userA',
    passwordHash: 'userA-hash'
  },
  {
    email: 'userB@test.com',
    name: 'userB',
    passwordHash: 'userB-hash'
  },
  {
    email: 'userB@test.com',
    name: 'userB',
    passwordHash: 'userB-hash'
  },
  {
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
    const user = await userDao.create(usersToCreate[0])

    expect(user.id).toEqual(expect.any(String))
    expect(user.email).toBe(usersToCreate[0].email)
    expect(user.name).toBe(usersToCreate[0].name)
    expect(user.passwordHash).toBe(usersToCreate[0].passwordHash)
  })

  let createdUsers: User[]
  describe('getters', () => {
    beforeEach(async () => {
      createdUsers = await Promise.all(
        usersToCreate.map((u) => userDao.create(u))
      )
    })

    describe('getUniqueById', () => {
      test('returns user if it exists', async () => {
        const user = await userDao.getUniqueById(createdUsers[1].id)

        expect(user).not.toBeUndefined()
        expect(user?.id).toBe(createdUsers[1].id)
        expect(user?.email).toBe(createdUsers[1].email)
      })

      test('returns undefined if it does not exist', async () => {
        const user = await userDao.getUniqueById('non-existent-id')

        expect(user).toBeUndefined()
      })
    })

    describe('getUniqueByName', () => {
      test('returns user if it exists', async () => {
        const user = await userDao.getUniqueByName(createdUsers[2].name)

        expect(user).not.toBeUndefined()
        expect(user?.name).toBe(createdUsers[2].name)
        expect(user?.email).toBe(createdUsers[2].email)
      })

      test('returns undefined if it does not exist', async () => {
        const user = await userDao.getUniqueByName('non-existent-name')

        expect(user).toBeUndefined()
      })
    })

    describe('getUniqueByEmail', () => {
      test('returns user if it exists', async () => {
        const user = await userDao.getUniqueByEmail(createdUsers[0].email)

        expect(user).not.toBeUndefined()
        expect(user?.id).toBe(createdUsers[0].id)
        expect(user?.email).toBe(createdUsers[0].email)
      })

      test('returns undefined if it does not exist', async () => {
        const user = await userDao.getUniqueByEmail('non-existent-email')

        expect(user).toBeUndefined()
      })
    })
  })
})
