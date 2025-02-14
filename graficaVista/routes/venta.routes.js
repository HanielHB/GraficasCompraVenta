// routes/venta.routes.js

const { verifyToken, isAdmin, isVendedor } = require("../middlewares/auth.middleware");
const controller = require("../controllers/venta.controller.js");

module.exports = app => {
    const router = require("express").Router();

    // Listar todas las ventas
    // Aquí asumimos que solo un admin puede ver todas las ventas.
    // Si también quieres que los vendedores vean las suyas, debes modificar la lógica en el controlador.
    router.get('/', [verifyToken], controller.listVentas);

    // Obtener venta por ID
    router.get('/:id', [verifyToken], controller.getVentaById);

    // Crear venta
    // Podría ser [verifyToken, isVendedor] si quieres que el vendedor cree sus ventas,
    // o [verifyToken, isAdmin] si solo el admin puede registrar ventas manualmente.
    router.post('/', [verifyToken], controller.createVenta);

    // Actualizar venta
    router.put('/:id', [verifyToken], controller.updateVenta);

    // Eliminar venta
    router.delete('/:id', [verifyToken], controller.deleteVenta);

    app.use('/ventas', router);
};
