import { ApolloServer } from 'apollo-server'
import { context } from './context'
import { schema } from './schema'

export const server = new ApolloServer({
  schema,
  context
})

server.listen({ port: parseInt(context.envObject.PORT) }).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
