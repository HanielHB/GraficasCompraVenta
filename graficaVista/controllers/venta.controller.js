const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");

// 1. Listar todas las ventas
exports.listVentas = async (req, res) => {
    try {
        // Incluimos opcionalmente usuario (vendedor) y producto asociado
        const ventas = await db.venta.findAll({
            include: [
                { 
                    model: db.usuario, 
                    as: "vendedorVenta",  // Alias para el vendedor
                    attributes: ["id", "nombre", "apellido", "tipo"] 
                },
                { 
                    model: db.usuario, 
                    as: "clienteVenta",   // Alias para el cliente
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
// 2. Obtener una venta por ID
exports.getVentaById = async (req, res) => {
    const id = req.params.id;
    try {
        const venta = await getVentaOr404(id, res);
        if (!venta) return; // La función ya maneja el 404

        // Si los productos están almacenados como string, conviértelos en JSON
        const productos = JSON.parse(venta.productos);  // Convierte los productos de string a objeto

        // Ahora puedes trabajar con el array de productos como un objeto
        venta.productos = productos;  // Si quieres devolverlo en la respuesta ya como un objeto

        res.json(venta);
    } catch (error) {
        sendError500(res, error);
    }
};


// 3. Crear una nueva venta
// controllers/venta.controller.js

// 3. Crear una nueva venta
// 3. Crear una nueva venta
exports.createVenta = async (req, res) => {
    const requiredFields = ["usuarioId", "clienteId", "productos", "fecha"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { usuarioId, clienteId, productos, fecha } = req.body;

        // Asegúrate de que productos esté en formato JSON antes de guardarlo
        if (productos) {
            req.body.productos = JSON.parse(productos); // Convierte el string a un objeto JSON
        }

        // Crear la venta con los productos como un arreglo de objetos JSON
        const nuevaVenta = await db.venta.create({
            usuarioId,
            clienteId,
            fecha,
            productos: req.body.productos  // Los productos ahora son un array de objetos
        });

        res.status(201).json(nuevaVenta);
    } catch (error) {
        sendError500(res, error);
    }
};


// 4. Actualizar una venta
exports.updateVenta = async (req, res) => {
    const id = req.params.id;
    try {
        const venta = await getVentaOr404(id, res);
        if (!venta) return;

        // Asegúrate de que productos esté en formato JSON antes de actualizar
        if (req.body.productos) {
            req.body.productos = JSON.parse(req.body.productos); // Convierte el string a un objeto JSON
        }

        if (req.body.usuarioId) venta.usuarioId = req.body.usuarioId;
        if (req.body.clienteId) venta.clienteId = req.body.clienteId;
        if (req.body.fecha) venta.fecha = req.body.fecha;
        if (req.body.productos) venta.productos = req.body.productos; // Actualizar los productos

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
