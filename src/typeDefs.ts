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
export type GOfflineUser = NexusGenObjects['OfflinePerson']
export type GPerson = NexusGenUnions['Person']

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
export interface DBUser extends WithId {
  name: string
  email: string
  passwordHash: string
}

export interface DBOfflinePerson extends WithId {
  name: string
}

export type DBPerson = DBUser | DBOfflinePerson

export interface DBExpense extends WithId {
  name: string
  timestamp: string
  totalAmount: number
}

export interface DBRelShouldPay {
  amount: number
}
