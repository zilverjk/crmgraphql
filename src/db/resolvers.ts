import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import Pedido from '../models/Pedido'
import Usuario from '../models/Usuario'
import Cliente from '../models/Cliente'
import Producto from '../models/Producto'
import { isValidObjectId } from 'mongoose'

dotenv.config({ path: '.env' })
const jwtSecret: string = process.env.JWT_SECRET || ''

const crearToken = (usuario: any, jwtSecret: string, expiresIn: string) => {
  const { id, email, nombre, apellido } = usuario
  return jwt.sign({ id, email, nombre, apellido }, jwtSecret, { expiresIn })
}

// Resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async (_: any, {}: any, ctx: any) => {
      return ctx.usuario
    },
    obtenerProductos: async () => {
      try {
        return await Producto.find({})
      } catch (error) {
        console.log(error)
      }
    },
    obtenerProducto: async (_: any, { id }: any) => {
      const producto = await Producto.findById(id)

      if (!producto) throw new Error('Producto no encontrado')

      return producto
    },
    obtenerClientes: async () => {
      try {
        return await Cliente.find({})
      } catch (error) {
        console.log(error)
      }
    },
    obtenerClientesVendedor: async (_: any, {}: any, ctx: any) => {
      try {
        return await Cliente.find({ vendedor: ctx.usuario.id.toString() })
      } catch (error) {
        console.log(error)
      }
    },
    obtenerCliente: async (_: any, { id }: any, ctx: any) => {
      // Validar existencia
      const cliente = await Cliente.findById(id)
      if (!cliente) throw new Error('El cliente no existe')

      // Quien lo creó puede verlo
      if (cliente.vendedor.toString() !== ctx.usuario.id) throw new Error('Acesso denegado')

      return cliente
    },
    obtenerPedidos: async () => {
      try {
        return await Pedido.find({})
      } catch (error) {
        console.log(error)
      }
    },
    obtenerPedidosVendedor: async (_: any, {}: any, ctx: any) => {
      try {
        return await Pedido.find({ vendedor: ctx.usuario.id })
      } catch (error) {
        console.log(error)
      }
    },
    obtenerPedido: async (_: any, { id }: any, ctx: any) => {
      // Validar ObjectId
      if (!isValidObjectId(id)) throw new Error('Pedido no encontrado')

      // Validar existencia
      const pedido = await Pedido.findById(id)

      if (!pedido) throw new Error('Pedido no encontrado')

      // Validar seguridad
      if (pedido.vendedor.toString() !== ctx.usuario.id) throw new Error('No autorizado')

      // Retorna resultado
      return pedido
    },
    obtenerPedidosEstado: async (_: any, { estado }: any, ctx: any) => {
      return await Pedido.find({ vendedor: ctx.usuario.id, estado })
    },
    mejoresClientes: async () => {
      return await Pedido.aggregate([
        { $match: { estado: 'COMPLETADO' } },
        {
          $group: {
            _id: '$clienteId',
            total: { $sum: '$total' },
          },
        },
        {
          $lookup: {
            from: 'clientes',
            localField: '_id',
            foreignField: '_id',
            as: 'cliente',
          },
        },
        {
          $sort: { total: -1 }, // El mayor primero
        },
      ])
    },
    mejoresVendedores: async () => {
      return await Pedido.aggregate([
        { $match: { estado: 'COMPLETADO' } },
        {
          $group: {
            _id: '$vendedor',
            total: { $sum: '$total' },
          },
        },
        {
          $lookup: {
            from: 'usuarios',
            localField: '_id',
            foreignField: '_id',
            as: 'vendedor',
          },
        },
        {
          $limit: 3,
        },
        {
          $sort: { total: -1 },
        },
      ])
    },
    buscarProducto: async (_: any, { texto }: any) => {
      return await Producto.find({ $text: { $search: texto } }).limit(10) //limit es opcional, tambien hay paginación
    },
  },
  Mutation: {
    nuevoUsuario: async (_: any, { input }: any) => {
      const { email, password } = input

      // Validar si ya existe el usuario
      const existeUsuario = await Usuario.findOne({ email })

      if (existeUsuario) throw new Error('El usuario ya esta registrado')

      //Hashear el password
      const salt = await bcrypt.genSalt(10)
      input.password = await bcrypt.hash(password, salt)

      // Insertar en la BD
      try {
        const usuario = new Usuario(input)
        usuario.save()

        return usuario
      } catch (error) {
        console.log(error)
      }
    },
    autenticarUsuario: async (_: any, { input }: any) => {
      const { email, password } = input

      // Si el usuario existe
      const usuairo = await Usuario.findOne({ email })

      if (!usuairo) throw new Error('El usuario no existe')

      // Validar si el Password es correcto
      const passwordCorrecto = await bcrypt.compare(password, usuairo.password)

      if (!passwordCorrecto) throw new Error('El password es incorrecto')

      // Crear Token
      return {
        token: crearToken(usuairo, jwtSecret, '24h'),
      }
    },
    nuevoProducto: async (_: any, { input }: any) => {
      try {
        const producto = new Producto(input)
        return await producto.save()
      } catch (error) {
        console.log(error)
      }
    },
    actualizarProducto: async (_: any, { id, input }: any) => {
      const producto = await Producto.findById(id)

      if (!producto) throw new Error('Producto no encontrado')

      // new: true es para que retorne el registro actualizado
      return await Producto.findOneAndUpdate({ _id: id }, input, { new: true })
    },
    eliminarProducto: async (_: any, { id }: any) => {
      const producto = await Producto.findById(id)

      if (!producto) throw new Error('Producto no encontrado')

      await Producto.findOneAndDelete({ _id: id })

      return 'Producto eliminado'
    },
    nuevoCliente: async (_: any, { input }: any, ctx: any) => {
      const { email } = input
      // Verificar si esta registrado

      const alreadyExists = await Cliente.findOne({ email })

      if (alreadyExists) throw new Error('Este cliente ya existe')

      const cliente = new Cliente(input)

      // Asignarle a un vendedor
      cliente.vendedor = ctx.usuario.id

      // Crear el registro en la BD
      try {
        return await cliente.save()
      } catch (error) {
        console.log(error)
      }
    },
    actualizarCliente: async (_: any, { id, input }: any, ctx: any) => {
      // Validar existencia
      const cliente = await Cliente.findById(id)

      if (!cliente) throw new Error('Cliente no existe')

      // Validar que sea el vendedor sea quien edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) throw new Error('No autorizado')

      // Actualizar el cliente
      return Cliente.findOneAndUpdate({ _id: id }, input, { new: true })
    },
    eliminarCliente: async (_: any, { id }: any, ctx: any) => {
      const cliente = await Cliente.findById(id)

      if (!cliente) throw new Error('El Cliente no existe')

      if (cliente.vendedor.toString() !== ctx.usuario.id) throw new Error('No autorizado')

      await Cliente.findOneAndDelete({ _id: id })
      return 'Cliente eliminado'
    },
    nuevoPedido: async (_: any, { input }: any, ctx: any) => {
      const { clienteId } = input

      // Validar existencia Cliente
      const cliente = await Cliente.findById(clienteId)

      if (!cliente) throw new Error('El cliente no existe')

      // Validar que el cliente sea del vendedor
      if (cliente.vendedor.toString() !== ctx.usuario.id) throw new Error('No autorizado')

      // Revisar stock disponible
      for await (const articulo of input.pedido) {
        const { id } = articulo
        const producto = await Producto.findById(id)

        // Validar que el producto exista en la BD
        if (!producto) throw new Error('El producto no existe')

        // Validar stock
        if (articulo.cantidad > producto.stock) {
          throw new Error(`El articulo ${producto.nombre} no cuenta con stock suficiente`)
        }

        // Comprometer Stock
        producto.stock = producto.stock - articulo.cantidad

        await producto.save()
      }

      // Crear un nuevo pedido
      const pedido = new Pedido(input)

      // Asignarle un vendedor
      pedido.vendedor = ctx.usuario.id

      // Guardar en BD
      return await pedido.save()
    },
    actualizarPedido: async (_: any, { id, input }: any, ctx: any) => {
      // Validar existencia Pedido
      const pedido = await Pedido.findById(id)

      if (!pedido) throw new Error('El pedido no existe')

      // Validar existencia Cliente
      const cliente = await Cliente.findById(pedido.clienteId)

      if (!cliente) throw new Error('El cliente no existe')

      // Validar si el cleinte y el pedido pertenece al vendedor
      if (cliente.vendedor.toString() !== ctx.usuario.id) throw new Error('No autorizado')

      // Validar Stock
      for await (const articulo of pedido.pedido) {
        const { id } = articulo
        const producto = await Producto.findById(id)

        // Validar que el producto exista en la BD
        if (!producto) throw new Error('El producto no existe')

        // Validar stock
        if (articulo.cantidad > producto.stock) {
          throw new Error(`El articulo ${producto.nombre} no cuenta con stock suficiente`)
        }

        // Comprometer Stock
        producto.stock = producto.stock - articulo.cantidad

        await producto.save()
      }

      // Actualizar el pedido
      return await Pedido.findOneAndUpdate({ _id: id }, input, { new: true })
    },
    eliminarPedido: async (_: any, { id }: any, ctx: any) => {
      const pedido = await Pedido.findById(id)

      if (!pedido) throw new Error('Pedido no encontrado')

      if (pedido.vendedor.toString() !== ctx.usuario.id) throw new Error('No autorizado')

      // Devolver stock
      pedido.pedido.map(async item => {
        const producto = await Producto.findById(item.id)

        if (!producto) throw new Error('El producto no existe')

        producto.stock = producto.stock + item.cantidad

        await producto.save()
      })

      await Pedido.findByIdAndDelete(id)

      return 'Pedido eliminado'
    },
  },
}

export default resolvers
