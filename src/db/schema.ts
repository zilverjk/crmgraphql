import { gql } from 'apollo-server'

// Schema
const typeDefs = gql`
  type Query {
    obtenerCurso: String
  }
`

export default typeDefs
