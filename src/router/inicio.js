const express = require('express');
const router = express.Router();

const Categoria = require("../models/Categoria");
const Producto = require("../models/Producto");
const Imagenes = require("../models/Imagenes");


// Ruta de ejemplo que renderiza una plantilla EJS
router.get('/', async (req, res) => {
  const productos = await Producto.findAll();
  const categoria = await Categoria.findAll();
  const imagenes = await Imagenes.findAll();

  // Unir los productos con las categorias por id
  productos.forEach(producto => {
    categoria.forEach(categoria => {
      if (producto.categoria_id === categoria.id) {
        // En el arreglo de productos se agrega la propiedad categoria con el nombre de la categoria  
        producto.categoria = categoria.nombre;
      }
    });

    // Filtrar las imagenes por producto_id
    const productoImagenes = imagenes.filter(imagen => imagen.producto_id === producto.id);
    // Agregar las imagenes al producto
    producto.imagenes = productoImagenes;
  });

  //reacomoda productos para mostrarlos en la vista
  let resumidoProductos = productos.map(producto => {
    let resumidoProducto = {
      id: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio: producto.precio,
      descripcion: producto.descripcion,
      material: producto.materiales,
      color: producto.colores,
      calificacion: producto.calificacionTotal,
      img: producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url : null
    };
    return resumidoProducto;
  });

  /* console.log(resumidoProductos); */
  res.render('public/productos', { data: resumidoProductos });
});

// Ruta para obtener un producto por su ID
router.get('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findByPk(id);

  if (producto) {
    //traer toda la informacion del producto (categoria e imagenes)
    const categoria = await Categoria.findByPk(producto.categoria_id);
    const imagenes = await Imagenes.findAll({ where: { producto_id: producto.id } });

    // Organizar la información en un arreglo
    let productoArr = [
      {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        nombre: categoria.nombre,
        codigo: producto.codigo,
        materiales: producto.materiales,
        color: producto.colores,
        precio: producto.precio,
        calificacion: producto.calificacionTotal,
        imgs: []
      }
    ];

    /* console.log(productoArr); */

    // Ordenar las imágenes por el atributo destacada y agregar las URLs al arreglo
    imagenes.sort((a, b) => b.destacada - a.destacada);
    imagenes.forEach((imagen, index) => {
      if (index < 4) {
        productoArr[0].imgs[index] = imagen.url;
      }
    });

    res.render('public/producto', { data: productoArr });
  }

  else {
    res.send({ message: "Producto no encontrado" });
  }
});

module.exports = router;