const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Se guardarán los archivos en la carpeta 'uploads'
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Se asigna un nombre único al archivo
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// El middleware que maneja la carga de archivos
const upload = multer({ storage: storage });

// 1. Listar todas las ventas
exports.listVentas = async (req, res) => {
    try {
        console.log("Usuario en listVentas:", req.user);

        if (!req.user) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const usuarioId = req.user.id;
        const tipoUsuario = req.user.tipo;

        let whereClause = {};

        if (tipoUsuario === "admin") {
            // Si es admin, puede ver todas las ventas
            whereClause = {};
        } else if (tipoUsuario === "vendedor") {
            // Si es vendedor, solo sus propias ventas
            whereClause = { usuarioId };
        } else if (tipoUsuario === "cliente") {
            // Si es cliente, solo las ventas donde él es el cliente
            whereClause = { clienteId: usuarioId };
        } else {
            return res.status(403).json({ error: "No tienes permisos para ver las ventas" });
        }

        const ventas = await db.venta.findAll({
            where: whereClause,
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

        return res.json(ventas);

    } catch (error) {
        console.error("Error en listVentas:", error);
        sendError500(res, error);
    }
};





exports.getVentaById = async (req, res) => {
    const id = req.params.id;
    try {
        const venta = await getVentaOr404(id, res);
        if (!venta) return;

        // Si los productos están almacenados como string, conviértelos en JSON
        venta.productos = JSON.parse(venta.productos);

        // Enviar la URL completa en la respuesta
        res.json({
            ...venta.toJSON(),
            imagen: venta.imagen ? `http://localhost:3000${venta.imagen}` : null
        });
    } catch (error) {
        sendError500(res, error);
    }
};



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

exports.uploadFile = [
    upload.single('archivo'), // Middleware de multer para manejar un archivo
    async (req, res) => {
        const ventaId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ error: "No se envió ningún archivo" });
        }

        try {
            // Buscar la venta correspondiente por el ID
            const venta = await db.venta.findByPk(ventaId);
            if (!venta) {
                return res.status(404).json({ error: "Venta no encontrada" });
            }

            // Guardar la ruta de la imagen en la base de datos
            const imagenPath = `/uploads/${req.file.filename}`;
            venta.imagen = imagenPath; // Guardamos la ruta en la BD
            await venta.save();

            res.status(200).json({
                message: "Archivo subido y asociado a la venta correctamente",
                fileName: req.file.filename,
                filePath: imagenPath // Enviamos la ruta completa
            });
        } catch (error) {
            console.error("Error al subir el archivo:", error);
            res.status(500).json({ error: "Error en el servidor" });
        }
    }
];


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
