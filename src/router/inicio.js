const express = require('express');
const router = express.Router();

// Ruta de ejemplo que renderiza una plantilla EJS
router.get('/', (req, res) => {
  res.render('inicio');
});



module.exports = router;