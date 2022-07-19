import type { ID, Optional, PartialExceptId, User } from '../CommonTypes'
import Dao from './Dao'

export class UserMemoryDao implements Dao<User> {
  private users: User[] = []

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = { ...user, id: (Math.random() * 1000).toFixed(0) }

    this.users.push(newUser)
    return newUser
  }

  getAll = async (): Promise<User[]> => this.users

  getBy = async <K extends keyof User>(
    key: K,
    value: User[K]
  ): Promise<Optional<User>> => this.users.find((u) => u[key] === value)

  getById = async (id: ID): Promise<Optional<User>> =>
    this.users.find((u) => u.id === id)

  async update(user: PartialExceptId<User>): Promise<Optional<User>> {
    const userIndex = this.users.findIndex((u) => u.id === user.id)

    if (userIndex >= 0) {
      this.users[userIndex] = { ...this.users[userIndex], ...user }
      return this.users[userIndex]
    }

    return undefined
  }

  async deleteById(id: ID): Promise<Optional<User>> {
    const userIndex = this.users.findIndex((u) => u.id === id)

    return userIndex > 0 ? this.users.splice(userIndex, 1)[0] : undefined
  }
}
