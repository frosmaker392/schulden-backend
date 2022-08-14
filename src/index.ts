import { ApolloServer } from 'apollo-server'
import Neo4J from 'neo4j-driver'

import { createContext } from './context'
import envObject from './env'
import { schema } from './schema'

const neo4jDriver = Neo4J.driver(
  'neo4j://localhost',
  Neo4J.auth.basic(envObject.NEO4J_USERNAME, envObject.NEO4J_PASSWORD)
  // For logging purposes
  /* {
    logging: {
      level: 'debug',
      logger: (level, message) => {
        console[level].call(console, `[${level.toUpperCase()}]: ${message}`)
      }
    }
  } */
)

// Stops the application if no db connection is present
neo4jDriver.verifyConnectivity()

const context = createContext(neo4jDriver, envObject)

const server = new ApolloServer({
  schema,
  context
})

server.listen({ port: parseInt(envObject.PORT) }).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
