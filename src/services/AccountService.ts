import { GUser } from '../typeDefs'
import { Service } from './Service'
import UserAdapter from '../adapters/UserAdapter'
import { UserDao } from '../daos/UserDao'

export default class AccountService extends Service {
  private userAdapter: UserAdapter = new UserAdapter()

  constructor(private userDao: UserDao) {
    super()
  }

  async getAll(): Promise<GUser[]> {
    return (await this.userDao.getAll()).map((u) => this.userAdapter.toGUser(u))
  }
}
