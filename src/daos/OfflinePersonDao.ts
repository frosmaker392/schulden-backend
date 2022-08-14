import { OfflinePerson } from '../models'
import { Optional } from '../utils/utilityTypes'

export interface OfflinePersonDao {
  create(ownerId: string, name: string): Promise<OfflinePerson>
  getAll(ownerId: string): Promise<OfflinePerson[]>
  deleteById(
    ownerId: string,
    personId: string
  ): Promise<Optional<OfflinePerson>>
}

export class OfflinePersonMemoryDao implements OfflinePersonDao {
  private personsMap: Record<string, OfflinePerson[]> = {}

  async create(ownerId: string, name: string): Promise<OfflinePerson> {
    const id = (Math.random() * 10000).toFixed(0)
    const person = new OfflinePerson(id, name)

    if (this.personsMap[ownerId] === undefined)
      this.personsMap[ownerId] = [person]
    else this.personsMap[ownerId].push(person)

    return person
  }

  async getAll(ownerId: string): Promise<OfflinePerson[]> {
    return this.personsMap[ownerId] ?? []
  }

  async deleteById(
    ownerId: string,
    personId: string
  ): Promise<Optional<OfflinePerson>> {
    const persons = this.personsMap[ownerId]
    if (persons === undefined || persons.length === 0) return

    const indexToDelete = persons.findIndex((p) => p.id === personId)
    if (indexToDelete < 0) return

    return persons.splice(indexToDelete, 1)[0]
  }
}
