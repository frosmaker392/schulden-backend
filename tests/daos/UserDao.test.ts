import { NexusGenObjects } from '../../nexus-typegen'
import { User } from '../../src/CommonTypes'
import { UserMemoryDao } from '../../src/daos/UserDao'

const testUsers: User[] = [
  {
    id: "test-id-1",
    email: "userA@test.com",
    username: "userA",
    passHash: "userA-hash"
  },
  {
    id: "test-id-2",
    email: "userB@test.com",
    username: "userB",
    passHash: "userB-hash"
  },
  {
    id: "test-id-3",
    email: "userC@test.com",
    username: "userC",
    passHash: "userC-hash"
  },
]

let userDao: UserMemoryDao
describe('UserMemoryDao', () => {
  beforeEach(() => {
    userDao = new UserMemoryDao()
  })

  test('create - can create user', () => {
    const user = userDao.create(testUsers[0])

    expect(user.id).not.toBeUndefined()
    expect(user.id).not.toBe(testUsers[0].id)
    expect(user.email).toBe(testUsers[0].email)
    expect(user.username).toBe(testUsers[0].username)
    expect(user.passHash).toBe(testUsers[0].passHash)
  })

  describe('getAll', () => {
    test('returns empty upon initialization', () => {
      expect(userDao.getAll()).toHaveLength(0)
    })

    test('returns correct list of all users', () => {
      for (const testUser of testUsers)
        userDao.create(testUser)

      const users = userDao.getAll()

      expect(users).toHaveLength(3)
      expect(users[0].username).toBe(testUsers[0].username)
      expect(users[1].username).toBe(testUsers[1].username)
      expect(users[2].username).toBe(testUsers[2].username)
    })
  })

  let createdUsers: User[]
  describe('getById', () => {
    beforeEach(() => {
      createdUsers = testUsers.map(testUser => userDao.create(testUser))
    })

    test('returns correct user associated with id', () => {
      const user = userDao.getById(createdUsers[0].id)

      expect(user?.username).toBe(createdUsers[0].username)
    })

    test('returns undefined if no user is found', () => {
      for (const testUser of testUsers)
        userDao.create(testUser)

      const user = userDao.getById('non-existent-id')

      expect(user).toBeUndefined()
    })
  })

  describe('update', () => {
    beforeEach(() => {
      createdUsers = testUsers.map(testUser => userDao.create(testUser))
    })

    test('returns updated user', () => {
      const updatedUser = userDao.update({
        id: createdUsers[0].id,
        username: "updatedUserA"
      })

      expect(updatedUser?.username).toBe("updatedUserA")
      expect(userDao.getById(
          createdUsers[0].id
        )?.username).toBe('updatedUserA')
    })

    test('returns undefined if no user is found', () => {
      const updatedUser = userDao.update({
        id: "non-existent-id",
        username: "updatedUsername"
      })

      expect(updatedUser).toBeUndefined()
    })
  })

  describe('deleteById', () => {
    beforeEach(() => {
      createdUsers = testUsers.map(testUser => userDao.create(testUser))
    })

    test('returns deleted user', () => {
      const deletedUser = userDao.deleteById(createdUsers[1].id)

      expect(deletedUser).toEqual(createdUsers[1])
      expect(userDao.getAll()).toHaveLength(2)
      expect(userDao.getById(createdUsers[1].id)).toBeUndefined()
    })

    test('returns undefined if no user is found', () => {
      const deletedUser = userDao.deleteById('non-existent-id')

      expect(deletedUser).toBeUndefined()
      expect(userDao.getAll()).toHaveLength(3)
    })
  })
})