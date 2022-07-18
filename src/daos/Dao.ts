import type { Optional, PartialExceptId, WithId } from "../CommonTypes"

export default interface Dao<T extends WithId> {
  create(entity: Omit<T, "id">): T
  getAll(): T[]
  getById(id: T["id"]): Optional<T>
  update(entity: PartialExceptId<T>): Optional<T>
  deleteById(id: T["id"]): Optional<T>
}