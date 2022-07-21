import dotenv from 'dotenv'
import EnvExtractor, { EnvObject } from './utils/EnvExtractor'

export const envKeys = ['PORT', 'APP_SECRET'] as const

const envDefaults: EnvObject<typeof envKeys> = {
  PORT: '4000',
  APP_SECRET: 'secret'
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

export default envObject
