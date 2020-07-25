import mongoose from 'mongoose'

interface IUsuario extends mongoose.Document {
  nombre: string
  apellido: string
  password: string
  email: string
}

const UsuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  apellido: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
})

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema)
