const express = require('express');
const jwt = require('jsonwebtoken');

const Calificacion = require('../models/Calificacion');
const router = express.Router();

const Producto = require('../models/Producto');

router.post('/', async (req, res) => {
    const { calificacion, idProducto, token } = req.body;


    jwt.verify(token, process.env.JWTSECRETO, async (err, decoded) => {
        try {
            if (err) {
                return res.status(401).json({ message: 'Token inválido, por favor inicie sesión de nuevo', error: "token" });
            }

            const data = {
                idUsuario: decoded.id,
                idProducto: parseInt(idProducto, 10),
                calificacion
            }

            await Calificacion.create(data)

            console.log("calificacion", data);

            // quiero sacar un promedio de calificaciones por el id de un producto ver cuantas estrellas tiene
            const calificaciones = await Calificacion.findAll({
                where: {
                    idProducto: idProducto
                }
            });


            console.log("calificaciones", calificaciones);

            const promedio = calificaciones => {
                const total = calificaciones.reduce((sum, calificacion) => sum + calificacion.dataValues.calificacion, 0);
                return total / calificaciones.length;
            };

            const promedioCalificacion = Math.round(promedio(calificaciones))

            //con promedio de calificaciones actualizo el producto
            const producto = await Producto.findByPk(idProducto);

            producto.calificacionTotal = promedioCalificacion;
            
            await producto.save();

            res.status(200).json({ message: 'Calificación realizada correctamente', calificacion });

        } catch (error) {
            console.log("calificacion", error);
            res.status(500).json({ message: 'Hubo un error al procesar la calificación' });
        }

    });

})

router.post('/:token', async (req, res) => {

    const { token, idProducto } = req.body;

    let userId;

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRETO);
        userId = decoded.id;
    } catch (err) {
        return res.status(400).json({ error: 'Invalid token' });
    }

    const calificacion = await Calificacion.findOne({
        where: {
            idUsuario: userId,
            idProducto: idProducto
        }
    });



    if (calificacion) {
        return res.status(200).json({ calificacion: calificacion.calificacion });
    } else {
        return res.status(200).json({ calificacion: 0 });
    }

});

module.exports = router;
