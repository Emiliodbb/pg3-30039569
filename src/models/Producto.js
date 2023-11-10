const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const Imagen = require("./Imagenes.js"); // Importa el modelo de Imagen
const Categoria = require("./Categoria"); // Importa el modelo de Categoria

class Producto extends Model { }

Producto.init({
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  precio: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  descripcion: {
    type: DataTypes.STRING,
  },

  materiales: {
    type: DataTypes.STRING,
  },

  colores: {
    type: DataTypes.STRING,
  },

  categoria_id: {
    type: DataTypes.INTEGER,

  },
},

  {
    sequelize,
    modelName: "producto",
  });

// Define la relación entre Producto e Imagen (uno a muchos)
Producto.hasMany(Imagen, { foreignKey: 'producto_id', as: 'imagenes' });

// Define la relación entre Producto y Categoria (uno a uno)
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

module.exports = Producto;
