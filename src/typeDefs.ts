import { NexusGenObjects, NexusGenUnions } from '../nexus-typegen'

// Basic types
export interface WithId {
  id: string
}

export interface JWTPayload {
  userId: string
}

// GraphQL types, derived from nexus-typegen
export type GUser = NexusGenObjects['User']
export type GUserResult = NexusGenUnions['UserResult']

export type GAuthResult = NexusGenUnions['AuthResult']
export type GAuthPayload = NexusGenObjects['AuthPayload']
export type GError = NexusGenObjects['Error']

// DB types
export interface DBUser extends WithId {
  name: string
  email: string
  passwordHash: string
}

export interface DBExpense extends WithId {
  name: string
  timestamp: string
  totalAmount: number
}

export interface DBRelShouldPay {
  amount: number
}
