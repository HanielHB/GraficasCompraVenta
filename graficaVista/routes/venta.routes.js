// routes/venta.routes.js

const { verifyToken, isAdmin, isVendedor, isAdminOrVendedor , isOwnerOrAdmin} = require("../middlewares/auth.middleware");
const controller = require("../controllers/venta.controller.js");

module.exports = app => {
    const router = require("express").Router();

    
    router.get('/', [verifyToken], controller.listVentas);

    // Obtener venta por ID
    router.get('/:id', [verifyToken], controller.getVentaById);

    
    router.post('/', [verifyToken, isAdminOrVendedor], controller.createVenta);

    // Actualizar venta
    router.put('/:id', [verifyToken, isOwnerOrAdmin], controller.updateVenta);

    // Eliminar venta
    router.delete('/:id', [verifyToken, isOwnerOrAdmin], controller.deleteVenta);

    app.use('/ventas', router);
};
