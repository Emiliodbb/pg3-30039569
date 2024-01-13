const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/config/db.sqlite', // Ruta a tu archivo SQLite
});

/* sequelize.query('DROP TABLE IF EXISTS clientes'); */

module.exports = sequelize;
