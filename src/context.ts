import * as Neo4J from 'neo4j-driver'

import { UserNeo4JDao } from './daos/UserDao'
import { envKeys } from './env'
import AuthService from './services/AuthService'
import { EnvObject } from './utils/EnvExtractor'

export interface Context {
  authService: AuthService
  envObject: EnvObject<typeof envKeys>
}

export const createContext = (
  neo4jDriver: Neo4J.Driver,
  envObject: EnvObject<typeof envKeys>
): Context => {
  // Initialize services
  const userDao = new UserNeo4JDao(neo4jDriver)
  const authService = new AuthService(userDao, envObject.APP_SECRET)

  return {
    authService,
    envObject
  }
}
