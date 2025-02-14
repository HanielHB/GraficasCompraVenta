const { verifyToken, isAdmin, isVendedor } = require("../middlewares/auth.middleware");
const controller = require("../controllers/compra.controller.js");

module.exports = app => {
    const router = require("express").Router();

    // Listar todas las compras
    // Solo los admins pueden ver todas las compras realizadas por cualquier usuario.
    router.get('/', [verifyToken], controller.listCompras);

    // Obtener una compra específica por ID
    // Permitido solo para admins, o podrías agregar lógica para que vendedores vean sus propias compras.
    router.get('/:id', [verifyToken], controller.getCompraById);

    // Crear una nueva compra
    // Solo vendedores pueden registrar sus propias compras.
    router.post('/', [verifyToken], controller.createCompra);

    // Actualizar una compra existente
    // Solo los admins pueden modificar detalles de una compra.
    router.put('/:id', [verifyToken], controller.updateCompra);

    // Eliminar una compra
    // Solo los admins pueden eliminar compras.
    router.delete('/:id', [verifyToken], controller.deleteCompra);

    app.use('/compras', router);
};
