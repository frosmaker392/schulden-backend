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
export type GUsers = NexusGenObjects['Users']
export type GUserResult = NexusGenUnions['UserResult']
export type GUsersResult = NexusGenUnions['UsersResult']

export type GAuthResult = NexusGenUnions['AuthResult']
export type GAuthPayload = NexusGenObjects['AuthPayload']
export type GError = NexusGenObjects['Error']

// DB types
export interface User extends WithId {
  name: string
  email: string
  passwordHash: string
}
