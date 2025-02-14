const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");

// 1. Listar todas las compras
exports.listCompras = async (req, res) => {
    try {
        // Incluimos opcionalmente usuario (vendedor) y producto asociado
        const compras = await db.compra.findAll({
            //where: { usuarioId: req.user.id }, // Filtrar por el usuario autenticado
            include: [
                { model: db.usuario, as: "vendedorCompra" }
            ]
        });
        res.json(compras);
    } catch (error) {
        sendError500(res, error);
    }
};

// 2. Obtener una compra por ID
exports.getCompraById = async (req, res) => {
    const id = req.params.id;
    try {
        const compra = await getCompraOr404(id, res);
        if (!compra) return; // Si no existe, la función ya maneja el 404
        res.json(compra);
    } catch (error) {
        sendError500(res, error);
    }
};

// 3. Crear una nueva compra
exports.createCompra = async (req, res) => {
    // Campos requeridos para crear una compra
    const requiredFields = ["usuarioId", "productoName", "cantidad", "precio","fecha"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { usuarioId, productoName, cantidad, precio,fecha } = req.body;
        const nuevaCompra = await db.compra.create({
            usuarioId,
            productoName,
            cantidad,
            precio,
            fecha
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

        if (req.body.usuarioId) compra.usuarioId = req.body.usuarioId;
        if (req.body.productoName) compra.productoName = req.body.productoName;
        if (req.body.cantidad) compra.cantidad = req.body.cantidad;
        if (req.body.precio) compra.precio = req.body.precio;
        if (req.body.fecha) compra.fecha = req.body.fecha;

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
            { model: db.usuario, as: "vendedorCompra" }
        ]
    });
    if (!compra) {
        res.status(404).json({ msg: "Compra no encontrada" });
        return null;
    }
    return compra;
}
