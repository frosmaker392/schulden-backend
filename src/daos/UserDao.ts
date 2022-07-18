import type { ID, Optional, PartialExceptId, User } from "../CommonTypes";
import Dao from "./Dao";

export interface UserDao extends Dao<User> {  }

export class UserMemoryDao implements UserDao {
  private users: User[] = []

  create(user: Omit<User, "id">): User {
    const newUser: User = { ...user, 
      id: (Math.random() * 1000).toFixed(0)
    }

    this.users.push(newUser)
    return newUser
  }

  getAll = (): User[] => this.users

  getById = (id: ID): Optional<User> => 
    this.users.find(u => u.id === id)

  update(user: PartialExceptId<User>): Optional<User> {
    const userIndex = this.users.findIndex(u => u.id === user.id)

    if (userIndex >= 0) {
      this.users[userIndex] = { ...this.users[userIndex], ...user }
      return this.users[userIndex]
    }

    return undefined
  }
  
  deleteById(id: ID): Optional<User> {
    const userIndex = this.users.findIndex(u => u.id === id)

    return userIndex > 0 
      ? this.users.splice(userIndex, 1)[0]
      : undefined
  }
}