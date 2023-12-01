//servidor de express
const express = require('express');
const path = require('path');

const app = express();

// parceando la informacion que llega desde el formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// carpeta de archivos estaticos
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

// configurando EJS
app.set('views', path.join(__dirname, '/src/view'));
app.set('view engine', 'ejs');

//Conexión a la base de datos
const db = require('./src/config/db.js');

db.sync({ logging: false }).then(() => {
    console.log("se inico la base de datos");
});

// importando las rutas
const inicio = require('./src/router/inicio');
const administracion = require('./src/router/admin.js');


app.use('/', inicio)
app.use('/admin', administracion)


//Puerto
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});