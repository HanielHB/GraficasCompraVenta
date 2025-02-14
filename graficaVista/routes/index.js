module.exports = app => {
    require('./usuario.routes')(app);
    require('./venta.routes')(app);
    //require('./producto.routes')(app);
    require('./compra.routes')(app);
};
