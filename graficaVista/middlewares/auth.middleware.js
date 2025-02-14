// middlewares/auth.middleware.js

const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "mi_secreto_super_seguro"; 
// Usa una variable de entorno para mayor seguridad.

// Middleware para verificar el token
// middlewares/auth.middleware.js
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ msg: "No se proporcionó un token" });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        
        // Agregar más datos al usuario
        req.user = {
            id: decoded.id,
            tipo: decoded.tipo,
            // Agregar estos nuevos campos si están en el token
            nombre: decoded.nombre,    // Asegurar que el token incluya estos
            apellido: decoded.apellido // campos al hacer login
        };
        
        next();
    } catch (error) {
        console.error("Error verificando el token:", error.message);
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
};

// Middleware para verificar si es admin
exports.isAdmin = (req, res, next) => {
    console.log("Usuario en req.user:", req.user);
    if (req.user.tipo !== "admin") {
        return res.status(403).json({ msg: "No tienes permisos de administrador" });
    }
    next();
};

// Middleware para verificar si es vendedor
exports.isVendedor = (req, res, next) => {
    console.log("Usuario en req.user:", req.user);
    if (req.user.tipo !== "vendedor") {
        return res.status(403).json({ msg: "No tienes permisos de vendedor" });
    }
    next();
};
