import * as Neo4J from 'neo4j-driver'
import jwt from 'jsonwebtoken'
import { Request } from 'express'

import { UserDao } from './daos/UserDao'
import { envKeys } from './env'
import AuthService from './services/AuthService'
import { EnvObject } from './utils/EnvExtractor'
import { JWTPayload } from './typeDefs'
import { Optional } from './utils/utilityTypes'
import ExpenseService from './services/ExpenseService'
import { OfflinePersonDao } from './daos/OfflinePersonDao'
import { ExpenseDao } from './daos/ExpenseDao'
import DebtService from './services/DebtService'
import { DebtDao } from './daos/DebtDao'

export interface Context {
  services: {
    auth: AuthService
    expense: ExpenseService
    debt: DebtService
  }
  envObject: EnvObject<typeof envKeys>
  userId?: string
}

type ContextFunction = (param: { req: Request }) => Context

export const createContext = (
  neo4jDriver: Neo4J.Driver,
  envObject: EnvObject<typeof envKeys>
): ContextFunction => {
  // Initialize DAOs
  const userDao = new UserDao(neo4jDriver)
  const offlinePersonDao = new OfflinePersonDao(neo4jDriver)
  const expenseDao = new ExpenseDao(neo4jDriver)
  const debtDao = new DebtDao(neo4jDriver)

  // Initialize services
  const services = {
    auth: new AuthService(userDao, envObject.APP_SECRET),
    expense: new ExpenseService(expenseDao, userDao, offlinePersonDao),
    debt: new DebtService(debtDao)
  }

  return ({ req }: { req: Request }) => {
    // Parse JWT token
    const authHeader = req.headers?.authorization?.replace('Bearer ', '')
    let token: Optional<JWTPayload>
    if (authHeader) {
      try {
        token = jwt.verify(
          authHeader,
          envObject.APP_SECRET
        ) as Optional<JWTPayload>
      } catch {
        token = undefined
      }
    }

    return {
      services,
      envObject,
      userId: token?.userId
    }
  }
}
