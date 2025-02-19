module.exports = (sequelize, Sequelize) => {
    const Venta = sequelize.define("venta", {
        fecha: {
            type: Sequelize.DATE,
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
        // Aquí almacenaremos los productos como JSON
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
