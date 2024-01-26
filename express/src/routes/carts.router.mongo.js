import { Router } from "express";
import { CartManagerMongo } from "../dao/CartManagerMongo.js";
import mongoose from "mongoose";
import { cartsModelo } from "../dao/models/carts.model.js";
import { ProductManagerMongo } from "../dao/ProductManagerMongo.js";
import { productsModelo } from "../dao/models/products.model.js";

export const router = Router();

const cartManagerMongo = new CartManagerMongo();

const productManagerMongo3 = new ProductManagerMongo();


// //*****MIDDLEWARE PARA AUTO IDENTIFICACION */
// const auth =(req, res, next)=>{ //USO del middleware // este midlewares esta asociado a la ruta de perfil
//   if(!req.session.usuario){
//      return  res.redirect('/login') //Obligatorio poner el return
//   }

//   next()
// }

// router.use(auth)

// //***END**MIDDLEWARE PARA AUTO IDENTIFICACION */

router.get("/", async (req, res) => {
  let carts = [];
  try {
    carts = await cartManagerMongo.getCartsMongo();
  } catch (error) {
    console.log(error.messsage);
  }
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ carts });
});

//conseguimos un carrito pór ID
router.get("/:cid", async (req, res) => {
  let { cid } = req.params;

  //se aplica retun al obtener error
  if (!mongoose.Types.ObjectId.isValid(cid)) {
    // con esta instruccion validamos que el ID sea Valido
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `Ingrese un id válido...!!!` });
  }

  let existe;

  try {
    // existe = await cartsModelo.findOne({deleted:false, _id:cid})
    existe = await cartManagerMongo.getCartsByIdMongo(cid);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }
  if (!existe) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe carrito con id ${cid}` });
  }
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ carrito: existe });
});

router.post("/", async (req, res) => {
  let { products } = req.body;

  // SE procede a crear el carrito vacio

  try {
    // let resultado = await cartsModelo.insertMany({products})
    let resultado = await cartManagerMongo.addCartMongo(products);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ payload: resultado });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  //Agregar al carrito con cid = 657c8f29fd01996207396277  el producto con pid =6572a3511e95089a27bee8df   si ya existe incrementa qty en 1 , si no existe agrega el producto al carrito con qty 1
  let { cid } = req.params;
  let { pid } = req.params;

  //NO se parsea
  // cid = parseInt(cid);
  // pid = parseInt(pid);

  console.log("codigo de carrito", cid);
  console.log("codigo de producto", pid);

  //se aplica retun al obtener error
  if (!mongoose.Types.ObjectId.isValid(cid)) {
    // con esta instruccion validamos que el cid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un carrito id válido...!!!` });
  }

  if (!mongoose.Types.ObjectId.isValid(pid)) {
    // con esta instruccion validamos que el pid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un producto id válido...!!!` });
  }

  //Buscar si cid existe
  let existeCid;
  try {
    existeCid = await cartsModelo.findOne({ deleted: false, _id: cid }).lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (!existeCid) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el carrito con id ${cid}` });
  }

  //Buscar si pid existe

  let existePid;
  try {
    existePid = await productsModelo
      .findOne({ deleted: false, _id: pid })
      .lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (!existePid) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el producto con id ${pid}` });
  }

  // Busca el carrrito por cid
  let carritoAbuscar;
  try {
    carritoAbuscar = await cartsModelo
      .findOne({ deleted: false, _id: cid })
      .lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  console.log(`Carrito a Buscar`, carritoAbuscar);

  if (!carritoAbuscar) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el carrito con id ${cid}` });
  }


  try {
    const resultado = await cartsModelo.findOneAndUpdate(
      {
        _id: cid,
        "products.productId": pid,
      },
      {
        $inc: {
          "products.$.qty": 1,
        },
      },
      {
        new: true,
      }
    );

    if (!resultado) {
      // Si el producto no existe en el carrito, lo agregamos
      const nuevoResultado = await cartsModelo.findOneAndUpdate(
        {
          _id: cid,
        },
        {
          $push: {
            products: {
              productId:pid,
              qty: 1,
            },
          },
        },
        {
          new: true,
        }
      );

      console.log("Carrito actualizado:", nuevoResultado);
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload: nuevoResultado});
    } else {
      console.log("Carrito actualizado:", resultado);
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload: resultado});
    }
  } catch (error) {
    console.error("Error al actualizar el carrito:", error.message);
      res.setHeader('Content-Type','application/json');
      return res.status(400).json({error:error.message});
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  //eliminar el carrito del producto seleccionado
  let { cid } = req.params;
  let { pid } = req.params;

  console.log("codigo de carrito", cid);
  console.log("codigo de producto", pid);

  //se aplica retun al obtener error
  if (!mongoose.Types.ObjectId.isValid(cid)) {
    // con esta instruccion validamos que el cid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un carrito id válido...!!!` });
  }

  if (!mongoose.Types.ObjectId.isValid(pid)) {
    // con esta instruccion validamos que el pid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un producto id válido...!!!` });
  }

  //Buscar si cid existe
  let existeCid;
  try {
    existeCid = await cartsModelo.findOne({ deleted: false, _id: cid }).lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (!existeCid) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el carrito con id ${cid}` });
  }

  //Buscar si pid existe

  let existePid;
  try {
    existePid = await productsModelo
      .findOne({ deleted: false, _id: pid })
      .lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (!existePid) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el producto con id ${pid}` });
  }

  //buscamos el producto dentro del array de carritos
  let cartBuscar, productosBuscar;
  try {
    // productosBuscar = await cartsModelo.find({}).lean()
    cartBuscar = await cartsModelo.findOne({ deleted: false, _id: cid }).lean();

    // console.log(productosBuscar)
    // console.log('cart a buscar', cartBuscar)
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  // bucando en el carrito si existe el producto con ID
  let productoIdAbuscar;
  try {
    productoIdAbuscar = await cartsModelo
      .findOne({
        products: { $elemMatch: { productId: pid } },
      })
      .lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (productoIdAbuscar) {
    //si existe eliminamos el carrito
    console.log("Producto encontrado", productoIdAbuscar);

    // http://localhost:8080/api/cartsmongo/6572ced376315d16a30cefde/product/6572a3511e95089a27bee8df

    const productoEliminar = await cartsModelo.updateOne(
      { _id: cid },
      {
        $pull: {
          products: {
            productId: pid,
          },
        },
      }
    );

    console.log(productoEliminar);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ payload: productoEliminar });
  } else {
    console.log("Producto no encontrado");
    // http://localhost:8080/api/cartsmongo/6572ced376315d16a30cefde/product/6572a3511e95089a27bee8df

    res.setHeader("Content-Type", "application/json");
    return res
      .status(200)
      .json({ payload: `No se encontro el producto con id  ${pid}` });
  }
});

router.put("/:cid", async (req, res) => {
  //actualizar el producto con un arreglo de productos enviados por req.body

  let { cid } = req.params; //capturamos el cid
  let productoDeBody = req.body.products; // capturamos el body

  // validamos si los carritoId tiene formato valido
  if (!mongoose.Types.ObjectId.isValid(cid)) {
    // con esta instruccion validamos que el cid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un carrito id válido...!!!` });
  }

  // Recorremos con map para sacar todos los productIds
  const productIds = productoDeBody.map((producto) => {
    return producto.productId;
  });
  // console.log(productIds)

  //recorre cada productId y valida es tiene formato valido de mongoose

  for (const productId of productIds) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      // con esta instruccion validamos que los productID son Validos
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: `el producto con Id ${productId} no tiene el formato valido, Ingrese un  id de prodcuto válido...!!!`,
      });
    }
  }

  //validamos si los productsId existen
  let existePid;
  for (const productId of productIds) {
    try {
      existePid = await productsModelo
        .findOne({ deleted: false, _id: productId })
        .lean();
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `error inesperado en el servidor -Intente mas tarde`,
        detalle: error.message,
      });
    }

    if (!existePid) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `No existe el producto con id ${productId}` });
    }
  }

  let productoActualizar;
  try {
    productoActualizar = await cartsModelo.updateOne(
      { deleted: false, _id: cid },
      {
        $set: {
          products: productoDeBody,
        },
      }
    );
  } catch (error) {
    console.log(error.message);
  }

  console.log(productoActualizar);

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({ payload: productoActualizar });
});

router.put("/:cid/products/:pid", async (req, res) => {
  //actualiza solo la cantidad del producto por cualquier catidad pasada por query
  let { cid } = req.params;
  let { pid } = req.params;
  let newQty = req.body.qty;

  console.log("codigo de carrito", cid);
  console.log("codigo de producto", pid);
  console.log("cantidad para actualizar", newQty);

  //se aplica retun al obtener error
  if (!mongoose.Types.ObjectId.isValid(cid)) {
    // con esta instruccion validamos que el cid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un carrito id válido...!!!` });
  }

  if (!mongoose.Types.ObjectId.isValid(pid)) {
    // con esta instruccion validamos que el pid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un producto id válido...!!!` });
  }

  //Buscar si cid existe
  let existeCid;
  try {
    existeCid = await cartsModelo.findOne({ deleted: false, _id: cid }).lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (!existeCid) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el carrito con id ${cid}` });
  }
  // res.setHeader('Content-Type','application/json');
  // return res.status(200).json({payload: existeCid});

  //Buscar si pid existe

  let existePid;
  try {
    existePid = await productsModelo
      .findOne({ deleted: false, _id: pid })
      .lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (!existePid) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el producto con id ${pid}` });
  }

  //Actualizando la cantidad del producto

  let carritoActualizar;
  try {
    carritoActualizar = await cartsModelo.findOneAndUpdate(
      { _id: cid, "products.productId": pid },
      { $set: { "products.$.qty": newQty } },
      { new: true }
    );
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  res.setHeader("Content-Type", "tapplication/json");
  return res.status(200).json({ payload: carritoActualizar });
});

router.delete("/:cid", async (req, res) => {
  //elimina todos los productos de un carrito
  let { cid } = req.params;

  console.log("codigo de carrito", cid);

  //se aplica retun al obtener error
  if (!mongoose.Types.ObjectId.isValid(cid)) {
    // con esta instruccion validamos que el cid sea Valido
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `Ingrese un carrito id válido...!!!` });
  }

  //Buscar si cid existe
  let existeCid;
  try {
    existeCid = await cartsModelo.findOne({ deleted: false, _id: cid }).lean();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  if (!existeCid) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(400)
      .json({ error: `No existe el carrito con id ${cid}` });
  }

  //vaciando el carrito

  let carritoVaciar;
  try {
    carritoVaciar = await cartsModelo.updateOne(
      { _id: cid },
      { $set: { products: [] } }
    );
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `error inesperado en el servidor -Intente mas tarde`,
      detalle: error.message,
    });
  }

  res.setHeader("Content-Type", "tapplication/json");
  return res.status(200).json({ payload: carritoVaciar });
});

router.post('/add-to-cart', async (req, res) => { //
  const { productId, title, description, price, thumbnail, code, stock, category, status } = req.body;
  const cartId = req.body.cartId;
  console.log('este es el valor de cartIds', cartId)

  // Verificamos que al menos se haya seleccionado un carrito
  if (!cartId) {
    return res.status(400).json({ error: 'Seleccione  un carrito.' });
  }

  //Aquí debes agregar lógica para agregar el producto al carrito seleccionado (cartId).

  try {
    const resultado = await cartsModelo.findOneAndUpdate(
      {
        _id: cartId,
        "products.productId": productId,
      },
      {
        $inc: {
          "products.$.qty": 1,
        },
      },
      {
        new: true,
      }
    );

    if (!resultado) {
      // Si el producto no existe en el carrito, lo agregamos
      const nuevoResultado = await cartsModelo.findOneAndUpdate(
        {
          _id: cartId,
        },
        {
          $push: {
            products: {
              productId:productId,
              qty: 1,
            },
          },
        },
        {
          new: true,
        }
      );

      console.log("Carrito actualizado:", nuevoResultado);
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload: nuevoResultado});
    } else {
      console.log("Carrito actualizado:", resultado);
        res.setHeader('Content-Type','application/json');
        return res.status(200).json({payload: resultado});
    }
  } catch (error) {
    console.error("Error al actualizar el carrito:", error.message);
      res.setHeader('Content-Type','application/json');
      return res.status(400).json({error:error.message});
  }


});

