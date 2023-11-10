const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

class Imagen extends Model { }

Imagen.init({
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    destacado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
},
{
    sequelize,
    modelName: "imagen"
});

module.exports = Imagen;
