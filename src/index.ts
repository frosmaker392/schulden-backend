import { ApolloServer } from 'apollo-server'
import Neo4J from 'neo4j-driver'
import { createContext } from './context'
import envObject from './env'

import { schema } from './schema'

const neo4jDriver = Neo4J.driver(
  'neo4j://localhost',
  Neo4J.auth.basic('neo4j', 'test')
)
const context = createContext(neo4jDriver, envObject)

export const server = new ApolloServer({
  schema,
  context
})

server
  .listen({ port: parseInt(context.envObject.PORT) })
  .then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
  .finally(() => {
    neo4jDriver.close()
  })
