// routes/venta.routes.js

const { verifyToken, isAdmin, isVendedor } = require("../middlewares/auth.middleware");
const controller = require("../controllers/venta.controller.js");

module.exports = app => {
    const router = require("express").Router();

    
    router.get('/', [verifyToken], controller.listVentas);

    // Obtener venta por ID
    router.get('/:id', [verifyToken], controller.getVentaById);

    
    router.post('/', [verifyToken], controller.createVenta);

    // Actualizar venta
    router.put('/:id', [verifyToken], controller.updateVenta);

    // Eliminar venta
    router.delete('/:id', [verifyToken], controller.deleteVenta);

    app.use('/ventas', router);
};
