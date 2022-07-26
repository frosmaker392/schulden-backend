import * as bcrypt from 'bcryptjs'

import { GUser, GUserResult, ID, User } from '../typeDefs'
import { Service } from './Service'
import UserAdapter from '../adapters/UserAdapter'
import { UserDao } from '../daos/UserDao'
import { Optional, PartialExcept } from '../utils/utilityTypes'

interface UserUpdateForm {
  id: ID
  username?: string
  password?: string
}

export default class AccountService extends Service {
  constructor(private userDao: UserDao) {
    super()
  }

  async getAll(): Promise<GUser[]> {
    return (await this.userDao.getAll()).map((u) => UserAdapter.toGUser(u))
  }

  async update(
    user: UserUpdateForm,
    actorID: Optional<ID>
  ): Promise<GUserResult> {
    if (!actorID || actorID !== user.id) return { errorMessage: 'Unauthorized' }

    const passwordHash = await (user.password
      ? bcrypt.hash(user.password, 10)
      : undefined)

    const dbUser: PartialExcept<User, 'id'> = {
      ...user,
      name: user.username,
      passwordHash
    }

    const updatedUser = await this.userDao.update(dbUser)
    return updatedUser
      ? UserAdapter.toGUser(updatedUser)
      : { errorMessage: 'User not found with given ID.' }
  }
}
