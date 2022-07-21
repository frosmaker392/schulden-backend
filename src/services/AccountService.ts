import { User } from '../CommonTypes'
import Dao from '../daos/Dao'
import { Service } from './Service'

export default class AccountService extends Service {
  constructor(private userDao: Dao<User>) {
    super()
  }

  async getAll(): Promise<User[]> {
    return this.userDao.getAll()
  }
}
