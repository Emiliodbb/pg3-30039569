
const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const Cliente = require('../models/Cliente.js')

const { JWTSECRETO, RECATCHA } = process.env;

router.get('/registro', (req, res) => {
    res.render("public/cliente/registro")
});


router.post('/register', async (req, res) => {
    const { nombre, correo, password, 'g-recaptcha-response': gRecaptchaResponse } = req.body;

    // Verifica la respuesta del reCAPTCHA
    const recaptchaSecret = RECATCHA;
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${gRecaptchaResponse}`;

    const recaptchaVerification = await axios.post(recaptchaUrl);

    if (!recaptchaVerification.data.success) {
        return res.status(400).send('Invalid reCAPTCHA.');
    }

    try {
        // Cifra la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const cliente = await Cliente.create({ nombre, correo, password: hashedPassword });

        // Genera un JWT
        const token = jwt.sign({ id: cliente.id }, JWTSECRETO, { expiresIn: '24h' });
        /* console.log(token); */

        // Envía el JWT en la respuesta
        res.json({ message: 'Cliente registrado con éxito', token });
    } catch (err) {
        // Maneja el error
        res.status(500).send('Error al registrar el cliente');
    }
});

router.get('/login', (req, res) => {
    res.render("public/cliente/login")
});

router.post('/login', async (req, res) => {
    const { correo, password, 'g-recaptcha-response': gRecaptchaResponse } = req.body;
    console.log({ correo, password, 'g-recaptcha-response': gRecaptchaResponse })
    // Verifica la respuesta del reCAPTCHA
    const recaptchaSecret = RECATCHA; 
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${gRecaptchaResponse}`;
  
    const recaptchaVerification = await axios.post(recaptchaUrl);
  
    if (!recaptchaVerification.data.success) {
      return res.status(400).send('Invalid reCAPTCHA.');
    }
    try {
        // Busca al usuario
        const cliente = await Cliente.findOne({ correo });
        console.log(cliente);
        if (!cliente) {
            return res.status(400).send('Correo o contraseña incorrectos');
        }
        
        console.log(cliente.password);
      // Verifica la contraseña
      const match = await bcrypt.compare(password, cliente.password);
     
      if (!match) {
          return res.status(400).send('Correo o contraseña incorrectos');
        }
  
      // Genera un JWT
      const token = jwt.sign({ id: cliente.id }, JWTSECRETO, { expiresIn: '24h' });
  
      // Envía el JWT en la respuesta
      res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (err) {
      // Maneja el error
      res.status(500).send('Error al iniciar sesión');
    }
  });

module.exports = router;
