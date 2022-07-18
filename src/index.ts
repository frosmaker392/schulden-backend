import { ApolloServer } from 'apollo-server'
import dotenv from 'dotenv'

import { context } from './context'

dotenv.config()

const getPort = (): number => {
  const portEnv = process.env.PORT
  const portNum = parseInt(portEnv ?? '')

  if (isNaN(portNum)) {
    console.warn("Port number not specified or invalid in env file! Defaulting to port 4000.")
    return 4000
  }

  return portNum
}

import { schema } from "./schema"
export const server = new ApolloServer({
  schema,
  context,
})

server.listen({ port: getPort() }).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})