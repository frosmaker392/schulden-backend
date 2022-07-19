import dotenv from 'dotenv'

import { UserDao, UserMemoryDao } from './daos/UserDao'
import EnvExtractor, { EnvObject } from './utils/EnvExtractor'

const envKeys = [
  "PORT",
  "APP_SECRET"
] as const

const envDefaults: EnvObject<typeof envKeys> = {
  PORT: '4000',
  APP_SECRET: 'secret'
}

interface Context { 
  userDao: UserDao
  envObject: EnvObject<typeof envKeys>
}

dotenv.config()

const envExtractor = new EnvExtractor(envKeys, envDefaults)
const { envObject, warnings } = envExtractor.getEnvVariables(process.env, 
  (key, defaultValue) => `Missing key "${key}" in env file! Defaulting value to "${defaultValue}"`)

// Print all warnings for missing env values
warnings.map(console.warn)

const userDao = new UserMemoryDao()

export const context: Context = {
  userDao,
  envObject
}