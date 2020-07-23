import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
const mongoConnection: string = process.env.DB_MONGO || ''

const conectarDB = async () => {
  try {
    await mongoose.connect(mongoConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    console.log('DB Conectada')
  } catch (error) {
    console.log('Ocurrió un error: ', error)
    process.exitCode
  }
}

export default conectarDB
