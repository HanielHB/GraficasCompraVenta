// controllers/venta.controller.js

const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");

// 1. Listar todas las ventas
exports.listVentas = async (req, res) => {
    try {
        // Incluimos opcionalmente usuario (vendedor) y producto asociado
        const ventas = await db.venta.findAll({
            include: [
                { model: db.usuario, as: "vendedorVenta" }
            ]
        });
        res.json(ventas);
    } catch (error) {
        sendError500(res, error);
    }
};

// 2. Obtener una venta por ID
exports.getVentaById = async (req, res) => {
    const id = req.params.id;
    try {
        const venta = await getVentaOr404(id, res);
        if (!venta) return; // La función ya maneja el 404
        res.json(venta);
    } catch (error) {
        sendError500(res, error);
    }
};

// 3. Crear una nueva venta
exports.createVenta = async (req, res) => {
    // Campos requeridos para crear una venta, ahora incluyendo 'precio'
    const requiredFields = ["usuarioId", "productoName", "cantidad", "fecha", "precio"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { usuarioId, productoName, cantidad, fecha, precio } = req.body;
        const nuevaVenta = await db.venta.create({
            usuarioId,
            productoName,
            cantidad,
            fecha,
            precio // Asegúrate de guardar el precio
        });
        res.status(201).json(nuevaVenta);
    } catch (error) {
        sendError500(res, error);
    }
};

// 4. Actualizar una venta
// 4. Actualizar una venta
exports.updateVenta = async (req, res) => {
    const id = req.params.id;
    try {
        const venta = await getVentaOr404(id, res);
        if (!venta) return;

        if (req.body.usuarioId) venta.usuarioId = req.body.usuarioId;
        if (req.body.productoName) venta.productoName = req.body.productoName;
        if (req.body.cantidad) venta.cantidad = req.body.cantidad;
        if (req.body.fecha) venta.fecha = req.body.fecha;
        if (req.body.precio) venta.precio = req.body.precio; // Actualizar el precio

        await venta.save();
        res.json(venta);
    } catch (error) {
        sendError500(res, error);
    }
};

// 5. Eliminar una venta
exports.deleteVenta = async (req, res) => {
    const id = req.params.id;
    try {
        const venta = await getVentaOr404(id, res);
        if (!venta) return;

        await venta.destroy();
        res.json({ msg: "Venta eliminada correctamente" });
    } catch (error) {
        sendError500(res, error);
    }
};

// Helper para obtener una venta o devolver 404
async function getVentaOr404(id, res) {
    const venta = await db.venta.findByPk(id, {
        include: [
            { model: db.usuario, as: "vendedorVenta" }
            
        ]
    });
    if (!venta) {
        res.status(404).json({ msg: "Venta no encontrada" });
        return null;
    }
    return venta;
}
