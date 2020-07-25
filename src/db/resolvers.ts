import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario'
// import Cliente from '../models/Cliente'
import Producto from '../models/Producto'

dotenv.config({ path: '.env' })
const jwtSecret: string = process.env.JWT_SECRET || ''

const crearToken = (usuario: any, jwtSecret: string, expiresIn: string) => {
  const { id, email, nombre, apellido } = usuario
  return jwt.sign({ id, email, nombre, apellido }, jwtSecret, { expiresIn })
}

// Resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async (_: any, { token }: any) => {
      return await jwt.verify(token, jwtSecret)
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
    nuevoCliente: async (_: any, { input }: any) => {
      // Verificar si esta registrado
      console.log(input)

      // Asignarle a un vendedor
      // Crear el registro en la BD
    },
  },
}

export default resolvers
