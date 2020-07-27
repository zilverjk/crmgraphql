import mongoose from 'mongoose'

interface IProducto extends mongoose.Document {
  nombre: string
  stock: number
  precio: number
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

// Crear un índice de tipo texto
ProductoSchema.index({ nombre: 'text' })

export default mongoose.model<IProducto>('Producto', ProductoSchema)
