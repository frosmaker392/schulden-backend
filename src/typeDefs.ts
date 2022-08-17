import {
  NexusGenInterfaces,
  NexusGenObjects,
  NexusGenUnions
} from '../nexus-typegen'

// Basic types
export interface JWTPayload {
  userId: string
}

// GraphQL types, derived from nexus-typegen
export type GUser = NexusGenObjects['User']
export type GOfflineUser = NexusGenObjects['OfflinePerson']
export type GPerson = NexusGenInterfaces['Person']

export type GUserResult = NexusGenUnions['UserResult']

export type GExpense = NexusGenObjects['Expense']
export type GExpenseResult = NexusGenUnions['ExpenseResult']
export type GExpensesResult = NexusGenUnions['ExpensesResult']

export type GAuthResult = NexusGenUnions['AuthResult']
export type GAuthPayload = NexusGenObjects['AuthPayload']
export type GError = NexusGenObjects['Error']

// DB types
export interface Neo4JEntity<T> {
  properties: T
}
export interface DBOfflinePerson {
  id: string
  name: string
}
export interface DBUser {
  id: string
  name: string
  email: string
  passwordHash: string
}

export type DBPerson = DBUser | DBOfflinePerson

export interface DBExpense {
  id: string
  name: string
  timestamp: string
  totalAmount: number
}

export interface DBRelShouldPay {
  amount: number
}
