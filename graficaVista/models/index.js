const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: "mysql",
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelos
db.usuario = require("./usuario.model.js")(sequelize, Sequelize);
db.compra = require("./compra.model.js")(sequelize, Sequelize);
db.venta = require("./venta.model.js")(sequelize, Sequelize);

/* 
  Relaciones Actualizadas
  ------------------------
  1. Un usuario (vendedor) puede tener muchas compras y ventas.
  2. Un usuario (cliente) puede tener muchas ventas asociadas.
*/

// 1. Relación Usuario (vendedor) -> Compras
db.usuario.hasMany(db.compra, {
  foreignKey: "usuarioId",
  as: "comprasRealizadas"
});
db.compra.belongsTo(db.usuario, {
  foreignKey: "usuarioId",
  as: "vendedorCompra"
});

// 2. Relación Usuario (vendedor) -> Ventas (como vendedor)
db.usuario.hasMany(db.venta, {
  foreignKey: "usuarioId",
  as: "ventasRealizadas"
});
db.venta.belongsTo(db.usuario, {
  foreignKey: "usuarioId",
  as: "vendedorVenta"
});

// 3. Nueva Relación: Usuario (cliente) -> Ventas (como cliente)
db.usuario.hasMany(db.venta, {
  foreignKey: "clienteId",
  as: "ventasComoCliente"
});
db.venta.belongsTo(db.usuario, {
  foreignKey: "clienteId",
  as: "clienteVenta"
});
// 4. Nueva Relación: Usuario (cliente) -> Compras (como cliente)
db.usuario.hasMany(db.compra, {
  foreignKey: "clienteId",
  as: "comprasComoCliente"
});
db.compra.belongsTo(db.usuario, {
  foreignKey: "clienteId",
  as: "clienteCompra"
});


module.exports = db;