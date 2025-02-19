// controllers/usuario.controller.js

const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "mi_secreto_super_seguro"; 
// Es recomendable usar variables de entorno para mayor seguridad.

// 1. Listar todos los usuarios
exports.listUsuarios = async (req, res) => {
    try {
        const whereCondition = {};
        if (req.query.tipo) {
            whereCondition.tipo = req.query.tipo;  // Filtra solo si "tipo" está en la consulta
        }

        const usuarios = await db.usuario.findAll({ where: whereCondition });
        res.json(usuarios);
    } catch (error) {
        sendError500(res, error);
    }
};


// 2. Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
    const id = req.params.id;
    try {
        const usuario = await getUsuarioOr404(id, res);
        if (!usuario) return; // getUsuarioOr404 ya envía la respuesta 404
        res.json(usuario);
    } catch (error) {
        sendError500(res, error);
    }
};

// 3. Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    // Campos requeridos
    const requiredFields = ["email", "password", "tipo", "nombre", "apellido", "fecha_ingreso"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { email, password, tipo, nombre, apellido, fecha_ingreso } = req.body;

        // Cifrar la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = await db.usuario.create({
            email,
            password: hashedPassword,
            tipo,
            nombre,
            apellido,
            fecha_ingreso
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        sendError500(res, error);
    }
};

// 4. Actualizar un usuario existente
exports.updateUsuario = async (req, res) => {
    const id = req.params.id;
    try {
        const usuario = await getUsuarioOr404(id, res);
        if (!usuario) return;

        // Actualizamos solo los campos que se envíen
        if (req.body.email) usuario.email = req.body.email;
        if (req.body.password) {
            usuario.password = await bcrypt.hash(req.body.password, 10);
        }
        if (req.body.tipo) usuario.tipo = req.body.tipo;
        if (req.body.nombre) usuario.nombre = req.body.nombre;
        if (req.body.apellido) usuario.apellido = req.body.apellido;
        if (req.body.fecha_ingreso) usuario.fecha_ingreso = req.body.fecha_ingreso;

        await usuario.save();
        res.json(usuario);
    } catch (error) {
        sendError500(res, error);
    }
};

// 5. Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    const id = req.params.id;
    try {
        const usuario = await getUsuarioOr404(id, res);
        if (!usuario) return;

        await usuario.destroy();
        res.json({ msg: "Usuario eliminado correctamente" });
    } catch (error) {
        sendError500(res, error);
    }
};

// 6. Login de usuario
exports.login = async (req, res) => {
    // Campos requeridos para login
    const requiredFields = ["email", "password"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const usuario = await db.usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, usuario.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Credenciales inválidas" });
        }

        // Generar token JWT (expira en 1 hora)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                tipo: usuario.tipo, 
                nombre: usuario.nombre, 
                apellido: usuario.apellido 
            }, 
            SECRET_KEY, 
            { expiresIn: "2h" }
        );

        // ✅ Enviar también el usuarioId en la respuesta
        res.json({ 
            token, 
            usuario: { id: usuario.id, email: usuario.email, tipo: usuario.tipo , nombre: usuario.nombre , apellido: usuario.apellido} 
        });

    } catch (error) {
        sendError500(res, error);
    }
};


// 7. Logout (manejo en frontend principalmente)
exports.logout = (req, res) => {
    try {
        // En el frontend se elimina el token del almacenamiento.
        res.json({ msg: "Sesión cerrada exitosamente" });
    } catch (error) {
        sendError500(res, error);
    }
};

// 8. Obtener perfil del usuario logeado
exports.getProfile = async (req, res) => {
    try {
        // El middleware de autenticación debe agregar el usuario en req.user
        const usuario = await db.usuario.findByPk(req.user.id, {
            attributes: ['id', 'nombre', 'apellido', 'email', 'tipo', 'fecha_ingreso']
        });
        
        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }
        
        res.json(usuario);
    } catch (error) {
        sendError500(res, error);
    }
};

// Helper para obtener un usuario o devolver 404
async function getUsuarioOr404(id, res) {
    const usuario = await db.usuario.findByPk(id);
    if (!usuario) {
        res.status(404).json({ msg: "Usuario no encontrado" });
        return null;
    }
    return usuario;
}
