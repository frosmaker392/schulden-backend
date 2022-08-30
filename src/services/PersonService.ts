import { ApolloError, ForbiddenError } from 'apollo-server'
import { OfflinePersonDao } from '../daos/OfflinePersonDao'
import { UserDao } from '../daos/UserDao'
import { GOfflinePerson, GPerson } from '../typeDefs'

export default class PersonService {
  constructor(
    private userDao: UserDao,
    private offlinePersonDao: OfflinePersonDao
  ) {}

  async createOfflinePerson(
    name: string,
    actorId?: string
  ): Promise<GOfflinePerson> {
    if (!actorId) throw new ForbiddenError('Unauthorized!')

    const createdPerson = this.offlinePersonDao.create(actorId, name)
    return createdPerson
  }

  async getPerson(personId: string, actorId?: string): Promise<GPerson> {
    if (!actorId) throw new ForbiddenError('Unauthorized!')

    const user = await this.userDao.getUniqueById(personId)
    if (user) return user

    const offlinePerson = (await this.offlinePersonDao.getAll(actorId)).find(
      (p) => p.id === personId
    )
    if (offlinePerson) return offlinePerson

    throw new ApolloError(`Cannot find person with id "${personId}"`)
  }

  async findPersons(name: string, actorId?: string): Promise<GPerson[]> {
    if (!actorId) throw new ForbiddenError('Unauthorized!')

    const users = name.length ? await this.userDao.findByName(name) : []
    const offlinePersons = await this.offlinePersonDao.getAll(actorId)

    return [
      ...users,
      ...offlinePersons.filter((p) => p.name.match(new RegExp(name)))
    ]
  }
}
