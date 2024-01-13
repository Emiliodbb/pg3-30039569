const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

class Compra extends Model { }

Compra.init({
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    producto_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total_pagado: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    ip_cliente: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'compra',
});

module.exports = Compra;