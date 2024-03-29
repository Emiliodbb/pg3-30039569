const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require("axios");
const ip = require('ip');
const email = require('../fn/email.js')

const Compra = require('../models/Compras.js');
const Cliente = require('../models/Cliente.js');

const { JWTSECRETO, API_URL, API_KEY } = process.env;

const router = express.Router();

router.post('/', async (req, res) => {
    const { amount, description, cardType, cvv, expirationMonth, expirationYear, productId, sessionToken } = req.body


    jwt.verify(sessionToken, JWTSECRETO, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido, por favor inicie sesión de nuevo', error: "token" });
        }

        const paymentData = {
            "amount": amount,
            "card-number": cardType,
            "cvv": cvv,
            "expiration-month": expirationMonth,
            "expiration-year": expirationYear,
            "full-name": "APPROVED",
            "currency": "USD",
            "description": description,
            "reference": `product_id:${productId}`,
        };


        axios.post(API_URL + "/payments", paymentData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            }
        })
            .then(async (response) => {
                const data = {
                    cliente_id: decoded.id,
                    ip_cliente: ip.address(),
                    id_transaccion: response.data.data.transaction_id,
                    producto_id: productId,
                    description: description,
                    cantidad: 1,
                    total_pagado: amount,
                }

                const { id } = decoded;

                //busca el correo por el id del cliente
                await Cliente.findByPk(id)
                    .then(cliente => {
                        const { correo } = cliente;
                        console.log(correo);    
                        email(correo, "Se realizo la compra exitosamente", "Gracias por su compra, su pedido esta en camino")
                    });



                Compra.create(data)
                    .then((compra) => {
                        res.status(200).json({ message: 'Pago procesado correctamente', compra });
                    })
                    .catch((error) => {
                        res.status(500).json({ message: 'Hubo un error al procesar el pago' });
                    });
            });
    });
});

module.exports = router;