const db = require("../models");
const { isRequestValid, sendError500 } = require("../utils/request.utils");

// 1. Listar todos los productos
exports.listProductos = async (req, res) => {
    try {
        // Si necesitas incluir las compras o ventas relacionadas, puedes usar:
        // const productos = await db.producto.findAll({ include: [db.compra, db.venta] });
        // De lo contrario, solo listamos los productos:
        const productos = await db.producto.findAll();
        res.json(productos);
    } catch (error) {
        sendError500(res, error);
    }
};

// 2. Obtener un producto por ID
exports.getProductoById = async (req, res) => {
    const id = req.params.id;
    try {
        const producto = await getProductoOr404(id, res);
        if (!producto) return;  // La función ya envía un 404 si no existe
        res.json(producto);
    } catch (error) {
        sendError500(res, error);
    }
};

// 3. Crear un nuevo producto
exports.createProducto = async (req, res) => {
    // Campos requeridos (ajusta según tu modelo)
    const requiredFields = ["nombre", "precio"];
    if (!isRequestValid(requiredFields, req.body, res)) return;

    try {
        const { nombre, precio } = req.body;

        const nuevoProducto = await db.producto.create({
            nombre,
            precio
        });

        res.status(201).json(nuevoProducto);
    } catch (error) {
        sendError500(res, error);
    }
};

// 4. Actualizar un producto
exports.updateProducto = async (req, res) => {
    const id = req.params.id;
    try {
        const producto = await getProductoOr404(id, res);
        if (!producto) return;

        if (req.body.nombre) producto.nombre = req.body.nombre;
        if (req.body.precio) producto.precio = req.body.precio;

        await producto.save();
        res.json(producto);
    } catch (error) {
        sendError500(res, error);
    }
};

// 5. Eliminar un producto
exports.deleteProducto = async (req, res) => {
    const id = req.params.id;
    try {
        const producto = await getProductoOr404(id, res);
        if (!producto) return;

        await producto.destroy();
        res.json({ msg: "Producto eliminado correctamente" });
    } catch (error) {
        sendError500(res, error);
    }
};

// Helper para obtener un producto o devolver 404
async function getProductoOr404(id, res) {
    const producto = await db.producto.findByPk(id);
    if (!producto) {
        res.status(404).json({ msg: "Producto no encontrado" });
        return null;
    }
    return producto;
}
