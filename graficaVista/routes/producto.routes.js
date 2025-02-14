// routes/producto.routes.js

const { verifyToken, isAdmin, isVendedor } = require("../middlewares/auth.middleware");
const controller = require("../controllers/producto.controller.js");

module.exports = app => {
    const router = require("express").Router();

    // Listar todos los productos
    // Generalmente, tanto admin como vendedores pueden ver los productos disponibles.
    router.get('/', [verifyToken], controller.listProductos);

    // Obtener un producto por ID
    router.get('/:id', [verifyToken], controller.getProductoById);

    // Crear un nuevo producto
    // Solo los admins tienen permisos para crear nuevos productos.
    router.post('/', [verifyToken, isAdmin], controller.createProducto);

    // Actualizar un producto
    // Solo los admins tienen permisos para actualizar productos.
    router.put('/:id', [verifyToken, isAdmin], controller.updateProducto);

    // Eliminar un producto
    // Solo los admins tienen permisos para eliminar productos.
    router.delete('/:id', [verifyToken, isAdmin], controller.deleteProducto);

    app.use('/productos', router);
};
