import mongoose from 'mongoose'

interface IPedido extends mongoose.Document {
  pedido: Array<IArticulos>
  total: number
  clienteId: string
  vendedor: string
  estado: string
}

interface IArticulos {
  id: string
  cantidad: number
}

const PedidoSchema = new mongoose.Schema({
  pedido: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Cliente',
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Usuario',
  },
  estado: {
    type: String,
    default: 'PENDIENTE',
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
})

export default mongoose.model<IPedido>('Pedido', PedidoSchema)
