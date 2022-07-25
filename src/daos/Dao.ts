import type { WithId } from '../typeDefs'
import { Optional, PartialExcept } from '../utils/utilityTypes'

export default interface Dao<T extends WithId> {
  create(entity: Omit<T, 'id'>): Promise<T>

  getAll(): Promise<T[]>
  getMany<K extends keyof T>(key: K, value: T[K]): Promise<T[]>
  getUnique<K extends keyof T>(key: K, value: T[K]): Promise<Optional<T>>

  update(entity: PartialExcept<T, 'id'>): Promise<Optional<T>>
  deleteById(id: T['id']): Promise<Optional<T>>
}
