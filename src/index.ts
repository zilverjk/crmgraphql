import { ApolloServer, gql } from 'apollo-server'
import typeDefs from './db/schema'
import resolvers from './db/resolvers'
import conectarDB from './config/db'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
const jwtSecret: string = process.env.JWT_SECRET || ''

// Conectar DB
conectarDB()

// Servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || ''

    if (token) return { usuario: jwt.verify(token, jwtSecret) }
  },
})

server.listen().then(({ url }) => {
  console.log(`Servidor listo en la URL ${url}`)
})
