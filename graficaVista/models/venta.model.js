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
        // Precio del producto
        precio: {
            type: Sequelize.DECIMAL(10, 2),  // DECIMAL con 10 dígitos en total y 2 decimales
            allowNull: false  // Hacerlo obligatorio si lo necesitas
        },
        // Clave foránea para relacionar con el usuario que realiza la venta
        usuarioId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        // Cliente (usuario de tipo 'cliente')
        clienteId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios', // Misma tabla de usuarios
                key: 'id'
            }
        }
    }, {
        timestamps: true,
        tableName: 'ventas'
    });

    return Venta;
};
