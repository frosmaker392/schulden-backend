import * as Neo4J from 'neo4j-driver'
import jwt from 'jsonwebtoken'
import { Request } from 'express'

import { UserNeo4JDao } from './daos/UserDao'
import { envKeys } from './env'
import AccountService from './services/AccountService'
import AuthService from './services/AuthService'
import { EnvObject } from './utils/EnvExtractor'
import { AuthTokenPayload } from './typeDefs'
import { Optional } from './utils/utilityTypes'

export interface Context {
  services: {
    auth: AuthService
    account: AccountService
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
    const services = {
      auth: new AuthService(userDao, envObject.APP_SECRET),
      account: new AccountService(userDao)
    }

    // Parse JWT token
    const authHeader = req.headers?.authorization?.replace('Bearer ', '')
    let token: Optional<AuthTokenPayload>
    if (authHeader) {
      token = jwt.verify(
        authHeader,
        envObject.APP_SECRET
      ) as Optional<AuthTokenPayload>
    }

    return {
      services,
      envObject,
      userId: token?.userId
    }
  }
