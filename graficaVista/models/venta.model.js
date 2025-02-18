// models/venta.js
module.exports = (sequelize, Sequelize) => {
    const Venta = sequelize.define("venta", {
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
        precio: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        usuarioId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        clienteId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id'
            }
        },
        // Este campo es para almacenar los productos de la venta como un arreglo JSON
        productos: {
            type: Sequelize.JSON,
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'ventas'
    });

    return Venta;
};
