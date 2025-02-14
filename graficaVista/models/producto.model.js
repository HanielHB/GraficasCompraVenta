module.exports = (sequelize, Sequelize) => {
    const Producto = sequelize.define("producto", {
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        precio: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        timestamps: true,
        tableName: 'productos'
    });

    return Producto;
};
