module.exports = (sequelize, Sequelize) => {
    const Compra = sequelize.define("compra", {
        cantidad: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        fecha: {
            type: Sequelize.DATE,
            allowNull: false
        },
        productoName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        // Precio del producto
        precio: {
            type: Sequelize.DECIMAL(10, 2),  // DECIMAL con 10 dígitos en total y 2 decimales
            allowNull: false  // Hacerlo obligatorio si lo necesitas
        },
        // Clave foránea para relacionar con el usuario que realiza la compra
        usuarioId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'compras'
    });

    return Compra;
};
