module.exports = (sequelize, Sequelize) => {
    const Compra = sequelize.define("compra", {
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
        // Almacenar los productos comprados como un JSON
        productos: {
            type: Sequelize.JSON,
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'compras'
    });

    return Compra;
};
