import type { Optional, PartialExceptId, WithId } from '../CommonTypes'

export default interface Dao<T extends WithId> {
  create(entity: Omit<T, 'id'>): Promise<T>

  getAll(): Promise<T[]>
  getById(id: T['id']): Promise<Optional<T>>
  getBy<K extends keyof T>(key: K, value: T[K]): Promise<Optional<T>>

  update(entity: PartialExceptId<T>): Promise<Optional<T>>
  deleteById(id: T['id']): Promise<Optional<T>>
}
