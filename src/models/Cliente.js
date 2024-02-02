const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

class Cliente extends Model { }

Cliente.init({
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
},
{
  sequelize,
  modelName: 'cliente',
});

module.exports = Cliente;