const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/config/db.sqlite', // Ruta a tu archivo SQLite
});

module.exports = sequelize;
