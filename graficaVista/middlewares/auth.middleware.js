const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "mi_secreto_super_seguro";

// Middleware base: Verificar token y extraer datos del usuario
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ msg: "No se proporcionó un token" });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = {
            id: decoded.id,
            tipo: decoded.tipo,
            nombre: decoded.nombre,
            apellido: decoded.apellido
        };
        next();
    } catch (error) {
        console.error("Error verificando el token:", error.message);
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
};

// Middleware: Solo administradores
exports.isAdmin = (req, res, next) => {
    if (req.user.tipo !== "admin") {
        return res.status(403).json({ msg: "Acceso restringido a administradores" });
    }
    next();
};

// Middleware: Solo vendedores
exports.isVendedor = (req, res, next) => {
    if (req.user.tipo !== "vendedor") {
        return res.status(403).json({ msg: "Acceso restringido a vendedores" });
    }
    next();
};

// Middleware: Solo clientes
exports.isCliente = (req, res, next) => {
    if (req.user.tipo !== "cliente") {
        return res.status(403).json({ msg: "Acceso restringido a clientes" });
    }
    next();
};

// Middleware: Admin o Vendedor
exports.isAdminOrVendedor = (req, res, next) => {
    if (!["admin", "vendedor"].includes(req.user.tipo)) {
        return res.status(403).json({ 
            msg: "Acceso restringido a administradores o vendedores" 
        });
    }
    next();
};

// Middleware: Usuario dueño del recurso o Admin
exports.isOwnerOrAdmin = (resourceUserId) => (req, res, next) => {
    if (req.user.tipo !== "admin" && req.user.id !== resourceUserId) {
        return res.status(403).json({ 
            msg: "No tienes permisos sobre este recurso" 
        });
    }
    next();
};