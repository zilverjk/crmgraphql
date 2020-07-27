import mongoose from 'mongoose'

interface ICliente extends mongoose.Document {
  nombre: string
  apellido: string
  empresa: string
  email: string
  telefono: string
  vendedor: string
}

const ClienteSchema = new mongoose.Schema({
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
  empresa: {
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
  telefono: {
    type: String,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario', // En que colección se encuentra este registro
  },
})

export default mongoose.model<ICliente>('Cliente', ClienteSchema)
