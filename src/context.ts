import * as Neo4J from 'neo4j-driver'
import jwt from 'jsonwebtoken'
import { Request } from 'express'

import { UserNeo4JDao } from './daos/UserDao'
import { envKeys } from './env'
import AuthService from './services/AuthService'
import { EnvObject } from './utils/EnvExtractor'
import { JWTPayload } from './typeDefs'
import { Optional } from './utils/utilityTypes'
import ExpenseService from './services/ExpenseService'
import { ExpenseNeo4JDao } from './daos/ExpenseDao'
import { OfflinePersonNeo4JDao } from './daos/OfflinePersonDao'

export interface Context {
  services: {
    auth: AuthService
    expense: ExpenseService
  }
  envObject: EnvObject<typeof envKeys>
  userId?: string
}

type ContextFunction = (param: { req: Request }) => Context

export const createContext =
  (
    neo4jDriver: Neo4J.Driver,
    envObject: EnvObject<typeof envKeys>
  ): ContextFunction =>
  ({ req }: { req: Request }) => {
    // Initialize services
    const userDao = new UserNeo4JDao(neo4jDriver)
    const offlinePersonDao = new OfflinePersonNeo4JDao(neo4jDriver)
    const expenseDao = new ExpenseNeo4JDao(neo4jDriver)

    const services = {
      auth: new AuthService(userDao, envObject.APP_SECRET),
      expense: new ExpenseService(expenseDao, userDao, offlinePersonDao)
    }

    // Parse JWT token
    const authHeader = req.headers?.authorization?.replace('Bearer ', '')
    let token: Optional<JWTPayload>
    if (authHeader) {
      token = jwt.verify(
        authHeader,
        envObject.APP_SECRET
      ) as Optional<JWTPayload>
    }

    return {
      services,
      envObject,
      userId: token?.userId
    }
  }
