import { NexusGenObjects, NexusGenUnions } from '../nexus-typegen'

// Basic types
export type ID = string

export interface WithId {
  id: ID
}

export interface AuthTokenPayload {
  userId: string
}

// GraphQL types, derived from nexus-typegen
export type GUser = NexusGenObjects['User']

export type GAuthPayload = NexusGenUnions['AuthPayload']
export type GAuthSuccess = NexusGenObjects['AuthSuccess']
export type GAuthFailure = NexusGenObjects['AuthFailure']

// DB types
export interface User extends WithId {
  name: string
  email: string
  passwordHash: string
}
