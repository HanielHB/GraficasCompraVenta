const { verifyToken, isAdmin, isVendedor, isAdminOrVendedor } = require("../middlewares/auth.middleware");

module.exports = app => {
    const router = require("express").Router();
    const controller = require("../controllers/usuario.controller.js");

    router.get('/me', verifyToken, controller.getProfile); // <-- Agregar esta línea


    // Retorna el rol (tipo) del usuario que porta el token
    router.get('/rol', verifyToken, (req, res) => {
        res.json({
            id: req.user.id,
            tipo: req.user.tipo
        });
    });
    
    // Rutas protegidas para administrar usuarios
    // Solo un ADMIN puede listar, obtener, crear, actualizar y eliminar usuarios
    router.get('/', [verifyToken], controller.listUsuarios);
    router.get('/:id', [verifyToken], controller.getUsuarioById);
    router.post('/', [verifyToken, isAdmin], controller.createUsuario);
    router.put('/:id', [verifyToken, isAdmin], controller.updateUsuario);
    router.delete('/:id', [verifyToken, isAdmin], controller.deleteUsuario);

    // Rutas públicas de login y logout
    router.post('/login', controller.login);
    router.post('/logout', controller.logout);

    // Montamos el router
    app.use('/usuarios', router);
};
