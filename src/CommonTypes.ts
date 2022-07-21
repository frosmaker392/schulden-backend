import { NexusGenObjects, NexusGenUnions } from '../nexus-typegen'

// Basic types
export type ID = string

export interface WithId {
  id: ID
}

// Utilities
export type Optional<T> = T | undefined
export type PartialExceptId<T> = WithId & Partial<Omit<T, 'id'>>

// Types derived from NexusGenObjects
export type User = NexusGenObjects['User'] & {
  passwordHash: string
}

export type AuthPayload = NexusGenUnions['AuthPayload']
export type AuthSuccess = NexusGenObjects['AuthSuccess']
export type AuthFailure = NexusGenObjects['AuthFailure']
