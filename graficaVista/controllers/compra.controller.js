const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");

// 1. Listar todas las compras
exports.listCompras = async (req, res) => {
    try {
        console.log("Usuario en listCompras:", req.user); // 🔍 Verificar en consola

        // Validar que el usuario exista
        if (!req.user) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        // Obtener el tipo y ID del usuario logeado desde el token
        const usuarioId = req.user.id;  // ✅ Corregido: usar req.user
        const tipoUsuario = req.user.tipo;  // ✅ Corregido: usar req.user

        // Si es admin, traemos todas las compras
        if (tipoUsuario === 'admin') {
            const compras = await db.compra.findAll({
                include: [
                    { 
                        model: db.usuario, 
                        as: "vendedorCompra",
                        attributes: ["id", "nombre", "apellido", "tipo"] 
                    },
                    { 
                        model: db.usuario, 
                        as: "clienteCompra", 
                        attributes: ["id", "nombre", "apellido", "tipo"] 
                    }
                ]
            });
            return res.json(compras);
        }

        // Si es vendedor, solo devolver las compras realizadas por el vendedor logeado
        const compras = await db.compra.findAll({
            where: {
                usuarioId: usuarioId  // ✅ Filtrar por compras del vendedor logeado
            },
            include: [
                { 
                    model: db.usuario, 
                    as: "vendedorCompra",
                    attributes: ["id", "nombre", "apellido", "tipo"] 
                },
                { 
                    model: db.usuario, 
                    as: "clienteCompra", 
                    attributes: ["id", "nombre", "apellido", "tipo"] 
                }
            ]
        });

        return res.json(compras);

    } catch (error) {
        console.error("Error en listCompras:", error);
        sendError500(res, error);
    }
};


// 2. Obtener una compra por ID
exports.getCompraById = async (req, res) => {
    const id = req.params.id;
    try {
        const compra = await getCompraOr404(id, res);
        if (!compra) return;

        // Convertir productos de string a JSON si es necesario
        if (typeof compra.productos === "string") {
            compra.productos = JSON.parse(compra.productos);
        }

        res.json(compra);
    } catch (error) {
        sendError500(res, error);
    }
};

// 3. Crear una nueva compra
exports.createCompra = async (req, res) => {
    const requiredFields = ["usuarioId", "clienteId", "productos", "fecha"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { usuarioId, clienteId, productos, fecha } = req.body;

        // Asegurar que productos esté en formato JSON antes de guardarlo
        if (typeof productos === "string") {
            req.body.productos = JSON.parse(productos);
        }

        const nuevaCompra = await db.compra.create({
            usuarioId,
            clienteId,
            fecha,
            productos: req.body.productos  // Guardar productos como JSON
        });

        res.status(201).json(nuevaCompra);
    } catch (error) {
        sendError500(res, error);
    }
};

// 4. Actualizar una compra existente
exports.updateCompra = async (req, res) => {
    const id = req.params.id;
    try {
        const compra = await getCompraOr404(id, res);
        if (!compra) return;

        // Asegurar que productos esté en formato JSON antes de actualizar
        if (req.body.productos && typeof req.body.productos === "string") {
            req.body.productos = JSON.parse(req.body.productos);
        }

        if (req.body.usuarioId) compra.usuarioId = req.body.usuarioId;
        if (req.body.clienteId) compra.clienteId = req.body.clienteId;
        if (req.body.fecha) compra.fecha = req.body.fecha;
        if (req.body.productos) compra.productos = req.body.productos;

        await compra.save();
        res.json(compra);
    } catch (error) {
        sendError500(res, error);
    }
};

// 5. Eliminar una compra
exports.deleteCompra = async (req, res) => {
    const id = req.params.id;
    try {
        const compra = await getCompraOr404(id, res);
        if (!compra) return;

        await compra.destroy();
        res.json({ msg: "Compra eliminada correctamente" });
    } catch (error) {
        sendError500(res, error);
    }
};

// Helper para obtener una compra o devolver 404
async function getCompraOr404(id, res) {
    const compra = await db.compra.findByPk(id, {
        include: [
            { model: db.usuario, as: "vendedorCompra" },
            { model: db.usuario, as: "clienteCompra" }
        ]
    });
    if (!compra) {
        res.status(404).json({ msg: "Compra no encontrada" });
        return null;
    }
    return compra;
}
