const Sequelize = require('sequelize');
const db = require('../config/db');

const Calificacion = db.define('calificacion', {
    idUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },

    idProducto: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },

    calificacion: {
        type: Sequelize.INTEGER,
        validate: {
            min: 1,
            max: 5
        },
        allowNull: false,
    }
});

module.exports = Calificacion;