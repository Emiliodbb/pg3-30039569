
const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const Cliente = require('../models/Cliente.js')

const email = require('../fn/email.js')

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
    email(correo, "Registro exitoso", "Bienvenido a nuestra tienda")
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

router.get('/reset-pass', (req, res) => {
  res.render("public/cliente/reset-pass")
});

router.post('/reset-pass', (req, res) => {
  const correo = req.body.correo;
  console.log(`Solicitud de recuperación de contraseña recibida para el correo: ${correo}`);


  const payload = {
    email: correo,
    timestamp: new Date().getTime(), // Añade la marca de tiempo para invalidar el token después de cierto tiempo
  };

  const secret = process.env.JWTSECRETO; // Deberías usar una clave secreta más segura y posiblemente almacenarla en variables de entorno

  const token = jwt.sign(payload, secret, { expiresIn: '1h' }); // El token expira en 1 hora


  email(correo, "Recuperación de contraseña", `
  Haz click en el siguiente enlace para recuperar tu contraseña: 
  http://localhost:3000/cliente/reset-pass/${token}`)

  res.send('Se ha enviado un correo con las instrucciones para recuperar tu contraseña');

});


router.get("/new-pass/:token", (req, res) => {
  const { token } = req.params;
  try {
    const payload = jwt.verify(token, process.env.JWTSECRETO);
    res.render("public/cliente/new-pass", { token });
  } catch (err) {
    res.status(400).send('Token inválido');
  }
})

router.post("/new-pass/:token", async (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.newPassword;

  console.log({ token, newPassword })
  try {
    // Verifica el token
    const secret = JWTSECRETO; // Deberías usar una clave secreta más segura y posiblemente almacenarla en variables de entorno
    const payload = jwt.verify(token, secret);

    // Busca al usuario en la base de datos
    const user = await Cliente.findOne({ email: payload.email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualiza la contraseña del usuario
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la contraseña.' });
  }
})

module.exports = router;
