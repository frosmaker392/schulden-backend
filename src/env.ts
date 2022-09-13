import dotenv from 'dotenv'
import EnvExtractor from './utils/EnvExtractor'

export const envKeys = [
  'PORT',
  'APP_SECRET',
  'NEO4J_USERNAME',
  'NEO4J_PASSWORD'
] as const

// Initialize environment variables
dotenv.config()

const envExtractor = new EnvExtractor(envKeys)
const envObject = envExtractor.getEnvVariables(process.env)

export default envObject
