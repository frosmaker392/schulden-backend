import dotenv from 'dotenv'

import { UserMemoryDao } from './daos/UserDao'
import AuthService from './services/AuthService'
import EnvExtractor, { EnvObject } from './utils/EnvExtractor'

const envKeys = ['PORT', 'APP_SECRET'] as const

const envDefaults: EnvObject<typeof envKeys> = {
  PORT: '4000',
  APP_SECRET: 'secret'
}

export interface Context {
  authService: AuthService
  envObject: EnvObject<typeof envKeys>
}

// Initialize environment variables
dotenv.config()

const envExtractor = new EnvExtractor(envKeys, envDefaults)
const { envObject, warnings } = envExtractor.getEnvVariables(
  process.env,
  (key, defaultValue) =>
    `Missing key "${key}" in env file! Defaulting value to "${defaultValue}"`
)

// Print all warnings for missing env values
warnings.map(console.warn)

// Initialize services
const userDao = new UserMemoryDao()
const authService = new AuthService(userDao, envObject.APP_SECRET)

export const context: Context = {
  authService,
  envObject
}
