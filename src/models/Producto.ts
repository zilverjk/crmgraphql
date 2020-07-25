import mongoose from 'mongoose'

interface IProducto extends mongoose.Document {
  nombre: string
  apellido: string
  password: string
  email: string
}

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
})

export default mongoose.model<IProducto>('Producto', ProductoSchema)
