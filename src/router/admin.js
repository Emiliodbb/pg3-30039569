const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');

const Categoria = require("../models/Categoria");
const Producto = require("../models/Producto");
const Imagenes = require("../models/Imagenes");
const multer = require('multer');

dotenv.config();

// login
router.get('/login', (req, res) => {
  res.render('admin/login');
});

// loguear
router.post('/login', (req, res) => {
  const usuario = req.body.usuario;
  const password = req.body.password;

  // Obtiene las variables de entorno para usuario y contraseña
  const { USUARIO, CONTRASENA } = process.env;

  if (usuario === USUARIO && password === CONTRASENA) {

    res.redirect('/admin/inicio');

  } else {
    res.send('contraseña incorrecta');
  }

  res.render('inicio');
});

// admin


// categorias
// obtener todas las categorias
router.get('/categorias', async (req, res) => {
  try {
    const categorias = await Categoria.findAll();

    res.render('admin/categoria', { datos: categorias });

  } catch (error) {

    console.error('Error al obtener las categorías:', error);
    res.status(500).json({ mensaje: 'Error al obtener las categorías' });

  }
})

// vista nueva categoria
router.get('/categorias-nueva', (req, res) => {
  res.render('admin/nueva-categoria');
})

// crear categoria
router.post('/categorias-nueva', async (req, res) => {
  try {
    const { nombre } = req.body;

    const nuevaCategoria = await Categoria.create({
      nombre,
    });

    res.redirect('/admin/categorias');
    /* res.status(201).json(nuevaCategoria); */
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    res.status(500).json({ mensaje: 'Error al crear la categoría' });
  }
})

// vista editar categoria
router.get('/categorias-editar/:id', async (req, res) => {

  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);

    res.render('admin/categoria-editar', { datos: categoria.dataValues });

  } catch (error) {
    console.log('Error al obtener la categoria:', error);
  }
})

// editar categoria
router.put('/categorias-editar/:id', async (req, res) => {

  try {

    console.log("hola")
    const { id } = req.params;
    const { nombre } = req.body;

    const categoria = await Categoria.findByPk(id);
    categoria.nombre = nombre;
    await categoria.save();

    res.redirect('/admin/categorias');

  } catch (error) {
    console.log('Error al obtener la categoria:', error);
  }
})

// Productos
// obtener todos los productos
router.get('/inicio', async (req, res) => {

  const productos = await Producto.findAll();


  const categoria = await Categoria.findAll();

  //unir los productos con las categorias por id
  productos.forEach(producto => {
    categoria.forEach(categoria => {
      if (producto.categoria_id === categoria.id) {
        // en el arreglo de productos se agrega la propiedad categoria con el nombre de la categoria  
        producto.categoria = categoria.nombre;

      }
    })
  })


  res.render('admin/inicio', { productos });
})

// vista crear producto
router.get('/producto-nuevo', async (req, res) => {

  //obtener categorias
  const categorias = await Categoria.findAll();


  res.render('admin/nuevo-producto', { datos: categorias });
})

// crear producto
router.post('/producto-nuevo', async (req, res) => {
  try {
    const { nombre, codigo, precio, descripcion, materiales, colores, categoria_id } = req.body;

    console.log({ nombre, codigo, precio, descripcion, materiales, colores, categoria_id })
    const nuevoProducto = await Producto.create({
      nombre,
      codigo,
      precio,
      descripcion,
      materiales,
      colores,
      categoria_id,
    });



    /* res.status(201).json(nuevoProducto); */
    res.redirect('/admin/inicio');
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ mensaje: 'Error al crear el producto' });
  }


})

// vista editar producto
router.get('/producto-actualizar/:id', async (req, res) => {

  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);

    //obtener categorias
    const categorias = await Categoria.findAll();




    //unir los producto con su categoria por id
    categorias.forEach(categoria => {
      if (producto.categoria_id === categoria.id) {
        // en el arreglo de productos se agrega la propiedad categoria con el nombre de la categoria  
        producto.categoria = categoria.nombre;

      }
    })

    res.render('admin/editar-producto', { datos: producto.dataValues, categorias, producto });

  } catch (error) {
    console.log('Error al obtener el producto:', error);
  }
})

// editar producto
router.put('/producto-actualizar/:id', async (req, res) => {

  try {

    const { id } = req.params;
    const { nombre, codigo, precio, descripcion, materiales, colores, categoria_id } = req.body;

    console.log({ nombre, codigo, precio, descripcion, materiales, colores, categoria_id })
    const producto = await Producto.findByPk(id);

    producto.nombre = nombre;
    producto.codigo = codigo;
    producto.precio = precio;
    producto.descripcion = descripcion;
    producto.materiales = materiales;
    producto.colores = colores;
    producto.categoria_id = categoria_id;

    await producto.save();

    res.redirect('/admin/inicio');

  } catch (error) {
    console.log('Error al obtener el producto:', error);
  }
})

// delete producto
router.delete('/producto-eliminar/:id', async (req, res) => {
  try {

    const { id } = req.params;

    const producto = await Producto.findByPk(id);

    await producto.destroy();

    res.redirect('/admin/inicio');

  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el producto' });
  }
})

// vista de agg imagen
router.get('/producto-imagen/:id', async (req, res) => {

  try {
    const { id } = req.params;

    res.render('admin/producto-img', { id });

  } catch (error) {
    console.log('Error al obtener el producto:', error);

  }
})

// Configura Multer para manejar las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/uploads/'); // Ruta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Nombre de archivo único
  }
});

const upload = multer({ storage: storage });


// agg imagen
router.post('/producto-imagen/:id', upload.array('img', 4), async (req, res) => {

  try {
    console.log("hola")
    const { id } = req.params;
    const inputArray = req.files;

    const outputArray = inputArray.map((item, index) => {
      const imgNumber = index + 1;
      return {
        name: `${item.originalname}`, // Se utiliza originalname como valor para name
        maxCount: 1,
        destacado: index === 0
      };
    });

    console.log(outputArray)

    // Iterar sobre los datos y crear instancias de Imagen
    for (const imagenData of outputArray) {
      await Imagenes.create({
        producto_id: id, // Obtener el ID del nombre
        url: `uploads/${imagenData.name}`, // Ajusta la ruta según tus necesidades
        destacado: imagenData.destacado,
      });
    }

    res.redirect('/admin/inicio');

  } catch (error) {
    console.log('Error al obtener el producto:', error);

  }
})



module.exports = router;