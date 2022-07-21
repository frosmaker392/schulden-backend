import * as Neo4J from 'neo4j-driver'

import { UserNeo4JDao } from './daos/UserDao'
import { envKeys } from './env'
import AccountService from './services/AccountService'
import AuthService from './services/AuthService'
import { EnvObject } from './utils/EnvExtractor'

export interface Context {
  services: {
    auth: AuthService
    account: AccountService
  }
  envObject: EnvObject<typeof envKeys>
}

export const createContext = (
  neo4jDriver: Neo4J.Driver,
  envObject: EnvObject<typeof envKeys>
): Context => {
  // Initialize services
  const userDao = new UserNeo4JDao(neo4jDriver)
  const services = {
    auth: new AuthService(userDao, envObject.APP_SECRET),
    account: new AccountService(userDao)
  }

  return {
    services,
    envObject
  }
}
