// models/usuario.model.js

module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define(
        "usuario",
        {
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true, // Verifica que sea un correo electrónico válido
                },
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false, // La contraseña será encriptada (hash)
            },
            tipo: {
                type: Sequelize.ENUM("admin", "vendedor","cliente"), // Roles: admin o vendedor
                allowNull: false,
            },
            nombre: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            apellido: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            fecha_ingreso: {
                type: Sequelize.DATE,
                allowNull: false, // Fecha en la que ingresó al sistema o a la empresa
            },
        },
        {
            timestamps: true, // Incluye createdAt y updatedAt por defecto
            tableName: "usuarios", // Nombre de la tabla en la base de datos
        }
    );

    return Usuario;
};
