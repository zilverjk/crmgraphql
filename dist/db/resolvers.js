"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Usuario_1 = __importDefault(require("../models/Usuario"));
// import Cliente from '../models/Cliente'
const Producto_1 = __importDefault(require("../models/Producto"));
dotenv_1.default.config({ path: '.env' });
const jwtSecret = process.env.JWT_SECRET || '';
const crearToken = (usuario, jwtSecret, expiresIn) => {
    const { id, email, nombre, apellido } = usuario;
    return jsonwebtoken_1.default.sign({ id, email, nombre, apellido }, jwtSecret, { expiresIn });
};
// Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: (_, { token }) => __awaiter(void 0, void 0, void 0, function* () {
            return yield jsonwebtoken_1.default.verify(token, jwtSecret);
        }),
        obtenerProductos: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                return yield Producto_1.default.find({});
            }
            catch (error) {
                console.log(error);
            }
        }),
        obtenerProducto: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            const producto = yield Producto_1.default.findById(id);
            if (!producto)
                throw new Error('Producto no encontrado');
            return producto;
        }),
    },
    Mutation: {
        nuevoUsuario: (_, { input }) => __awaiter(void 0, void 0, void 0, function* () {
            const { email, password } = input;
            // Validar si ya existe el usuario
            const existeUsuario = yield Usuario_1.default.findOne({ email });
            if (existeUsuario)
                throw new Error('El usuario ya esta registrado');
            //Hashear el password
            const salt = yield bcrypt_1.default.genSalt(10);
            input.password = yield bcrypt_1.default.hash(password, salt);
            // Insertar en la BD
            try {
                const usuario = new Usuario_1.default(input);
                usuario.save();
                return usuario;
            }
            catch (error) {
                console.log(error);
            }
        }),
        autenticarUsuario: (_, { input }) => __awaiter(void 0, void 0, void 0, function* () {
            const { email, password } = input;
            // Si el usuario existe
            const usuairo = yield Usuario_1.default.findOne({ email });
            if (!usuairo)
                throw new Error('El usuario no existe');
            // Validar si el Password es correcto
            const passwordCorrecto = yield bcrypt_1.default.compare(password, usuairo.password);
            if (!passwordCorrecto)
                throw new Error('El password es incorrecto');
            // Crear Token
            return {
                token: crearToken(usuairo, jwtSecret, '24h'),
            };
        }),
        nuevoProducto: (_, { input }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const producto = new Producto_1.default(input);
                return yield producto.save();
            }
            catch (error) {
                console.log(error);
            }
        }),
        actualizarProducto: (_, { id, input }) => __awaiter(void 0, void 0, void 0, function* () {
            const producto = yield Producto_1.default.findById(id);
            if (!producto)
                throw new Error('Producto no encontrado');
            // new: true es para que retorne el registro actualizado
            return yield Producto_1.default.findOneAndUpdate({ _id: id }, input, { new: true });
        }),
        eliminarProducto: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
            const producto = yield Producto_1.default.findById(id);
            if (!producto)
                throw new Error('Producto no encontrado');
            yield Producto_1.default.findOneAndDelete({ _id: id });
            return 'Producto eliminado';
        }),
        nuevoCliente: (_, { input }) => __awaiter(void 0, void 0, void 0, function* () {
            // Verificar si esta registrado
            console.log(input);
            // Asignarle a un vendedor
            // Crear el registro en la BD
        }),
    },
};
exports.default = resolvers;
