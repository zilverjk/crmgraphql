import { ApolloServer, gql } from 'apollo-server'
import typeDefs from './db/schema'
import resolvers from './db/resolvers'
import conectarDB from './config/db'

// Conectar DB
conectarDB()

// Servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`)
})
