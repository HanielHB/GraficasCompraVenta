// routes/venta.routes.js

const { verifyToken, isAdmin, isVendedor, isAdminOrVendedor , isOwnerOrAdmin} = require("../middlewares/auth.middleware");
const controller = require("../controllers/venta.controller.js");
const upload = require("../middlewares/upload");  // Importamos multer

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

    // Nueva ruta para subir archivos
    // Cambiar esta línea para que sea dinámica con el ID de la venta
    router.post('/upload/:id', [verifyToken, isAdminOrVendedor], controller.uploadFile);


    app.use('/ventas', router);
};
