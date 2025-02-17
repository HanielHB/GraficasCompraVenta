// controllers/venta.controller.js

const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");

// 1. Listar todas las ventas
exports.listVentas = async (req, res) => {
    try {
        const ventas = await db.venta.findAll({
            include: [
                { 
                    model: db.usuario, 
                    as: "vendedorVenta",
                    attributes: ["id", "nombre", "apellido", "tipo"] 
                },
                { 
                    model: db.usuario, 
                    as: "clienteVenta",
                    attributes: ["id", "nombre", "apellido", "tipo"] 
                }
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
        if (!venta) return;
        res.json(venta);
    } catch (error) {
        sendError500(res, error);
    }
};

// 3. Crear una nueva venta
exports.createVenta = async (req, res) => {
    const requiredFields = ["usuarioId", "clienteId", "productoName", "cantidad", "fecha", "precio"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { usuarioId, clienteId, productoName, cantidad, fecha, precio } = req.body;
        
        // Validar que el cliente sea de tipo 'cliente'
        const cliente = await db.usuario.findByPk(clienteId);
        if (!cliente || cliente.tipo !== "cliente") {
            return res.status(400).json({ 
                msg: "El cliente seleccionado no es válido" 
            });
        }

        const nuevaVenta = await db.venta.create({
            usuarioId,
            clienteId,
            productoName,
            cantidad,
            fecha,
            precio
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

        // Validar nuevo cliente si se actualiza
        if (req.body.clienteId) {
            const cliente = await db.usuario.findByPk(req.body.clienteId);
            if (!cliente || cliente.tipo !== "cliente") {
                return res.status(400).json({ 
                    msg: "El cliente seleccionado no es válido" 
                });
            }
            venta.clienteId = req.body.clienteId;
        }

        // Resto de campos
        if (req.body.productoName) venta.productoName = req.body.productoName;
        if (req.body.cantidad) venta.cantidad = req.body.cantidad;
        if (req.body.fecha) venta.fecha = req.body.fecha;
        if (req.body.precio) venta.precio = req.body.precio;

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
            { model: db.usuario, as: "vendedorVenta" },
            { model: db.usuario, as: "clienteVenta" }
        ]
    });
    if (!venta) {
        res.status(404).json({ msg: "Venta no encontrada" });
        return null;
    }
    return venta;
}