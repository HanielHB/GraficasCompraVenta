const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

// Inicializamos Sequelize con la configuración de la BD
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: "mysql",
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importamos los modelos
db.usuario = require("./usuario.model.js")(sequelize, Sequelize);
//db.producto = require("./producto.model.js")(sequelize, Sequelize);
db.compra = require("./compra.model.js")(sequelize, Sequelize);
db.venta = require("./venta.model.js")(sequelize, Sequelize);

/* 
  Definición de Relaciones
  ------------------------
  1) Un usuario (tipo: vendedor) puede realizar muchas compras.
  2) Un usuario (tipo: vendedor) puede realizar muchas ventas.
  3) Un producto puede aparecer en muchas compras.
  4) Un producto puede aparecer en muchas ventas.
*/

// 1. Relación 1:N - Usuarios (vendedores) y Compras
db.usuario.hasMany(db.compra, {
  foreignKey: "usuarioId",
  as: "comprasRealizadas" // alias de la relación
});
db.compra.belongsTo(db.usuario, {
  foreignKey: "usuarioId",
  as: "vendedorCompra" // alias inverso
});

// 2. Relación 1:N - Usuarios (vendedores) y Ventas
db.usuario.hasMany(db.venta, {
  foreignKey: "usuarioId",
  as: "ventasRealizadas"
});
db.venta.belongsTo(db.usuario, {
  foreignKey: "usuarioId",
  as: "vendedorVenta"
});



module.exports = db;
