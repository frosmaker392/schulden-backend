import { GUser, User } from '../typeDefs'
import Dao from '../daos/Dao'
import { Service } from './Service'
import UserAdapter from '../adapters/UserAdapter'

export default class AccountService extends Service {
  private userAdapter: UserAdapter = new UserAdapter()

  constructor(private userDao: Dao<User>) {
    super()
  }

  async getAll(): Promise<GUser[]> {
    return (await this.userDao.getAll()).map((u) => this.userAdapter.toGUser(u))
  }
}
