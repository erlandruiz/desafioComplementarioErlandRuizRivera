import { Router } from 'express';
// import { ProductManager } from '../ProductManager.js';
export const router=Router()


import { join } from "path";//Utilizamos el path para poder trabajar con rutas absolutas
import __dirname from '../../../utils2.js'; //Importamos utils para poder trabvajar con rutas absolutas
import { ProductManager } from '../ProductManager.js';
import { io } from '../app.js';
import { productsModelo } from '../dao/models/products.model.js';
import { ProductManagerMongo } from '../dao/ProductManagerMongo.js';

import mongoose from 'mongoose';
import { CartManagerMongo } from '../dao/CartManagerMongo.js';
import { cartsModelo } from '../dao/models/carts.model.js';
import { auth } from '../utils.js';





const productManagerMongo = new ProductManagerMongo() //utilizamos la clase ProductManagerMongo()

const cartManagerMongo = new CartManagerMongo();


//*****MIDDLEWARE PARA AUTO IDENTIFICACION */
// const auth =(req, res, next)=>{ //USO del middleware // este midlewares esta asociado a la ruta de perfil
//   if(!req.session.usuario){
//      return  res.redirect('/login') //Obligatorio poner el return
//   }

//   next()
// }

// const auth2=(req, res, next)=>{// este midlewares esta asociado a la ruta de login y de registro
//   if(req.session.usuario){
//       return res.redirect('/perfil')//Obligatorio poner el return
//   }

//   next()
// }
//****END *MIDDLEWARE PARA AUTO IDENTIFICACION */



let archivo = join(__dirname, "/archivos/products.json");
console.log(archivo)

const productManager = new ProductManager(archivo)

router.get('/', auth, async (req,res)=>{

    try {
        let resultado =  await productManager.getProductsAsyncFS();
        // res.setHeader('Content-Type','text/html');
        res.status(200).render('home',{resultado, titulo :'Home Page', estilo:"stylesHome", login:req.user?true:false }) //APlica ternario para saber si esta logueado

    } catch (error) {
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`error`});
    }



    
})
router.get('/realtimeproducts', auth,  async (req,res)=>{
    try {
         
        let resultado =  await productManager.getProductsAsyncFS();
        res.status(200).render('realtimeproducts',{resultado, titulo :'RealTime Page', estilo:"stylesHome"})

    } catch (error) {
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`error`});
    }
}
)


router.get('/chat', auth,  (req,res)=>{
    try {
         
      
        res.status(200).render('chat', {titulo:"Chat", estilo:"styles"})

    } catch (error) {
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`error`});
    }
}
)

router.get('/products', auth,  async (req,res)=>{ //trabajando con la vista de paginate

    let pagina =1  

    if (req.query.pagina) {//capturamos el  valor de pagina
        pagina = req.query.pagina
        // console.log(pagina)
    }

    let limit =10;
    if(req.query.limit){  //capturamos el  valor de limit 
      limit= req.query.limit
    //   console.log(limit)
    }
  
    let query = {};
  

    // Verifica si se proporciona el parámetro de consulta 'querydata'
    if (req.query.querydata) {
      // Asigna el valor de 'querydata' al campo 'category' en el objeto de consulta
      
      query = { category: req.query.querydata };
    //   console.log(query);
    }

    let sortDirection = req.query.sort === '1' ? 1 : req.query.sort === '-1' ? -1 : undefined;  //Capturamos el valor de Sort 

    let sortOptions = sortDirection ? { price: sortDirection } : undefined;//sortDirection evalúa el valor de req.query.sort y asigna el valor adecuado a sortOptions. Si req.query.sort es '1', se ordenará ascendente; si es '-1', se ordenará descendente; y si no llega ningún valor, no se aplicará ordenación.

    let productos
    try {
        productos = await productsModelo.paginate(query, {lean: true, limit:limit, page:pagina, sort: sortOptions})//ya esta instalado el plugin de paginate 'mongoose-paginate-v2'
        // console.log(productos)
        //Los documentos viene de una propiedad llamada docs
        //mongoose-paginate trae por defecto el paginado de 10
        
    } catch (error) {
        console.log(error)
        productos=[]
    }


    let {totalPages, page,  hasPrevPage, hasNextPage, prevPage, nextPage, totalDocs} = productos

    // console.log(totalPages, page,  hasPrevPage, hasNextPage, prevPage, nextPage, totalDocs)

     
        res.status(200).render('homepagemongo',{productos: productos.docs, limit, sortDirection, query, pagina, totalPages,page, totalDocs, hasPrevPage, hasNextPage, prevPage, nextPage, })

  
}
);




router.get('/products/:pid', async (req,res)=>{//Vista para mostrar el producto y en que carrito desea guardarlo

    let {pid} = req.params
    let existe 
  
    if(!mongoose.Types.ObjectId.isValid(pid)){ // con esta instruccion validamos que el ID sea Valido 
      res.setHeader('Content-Type','application/json');
      return res.status(400).json({error:`Ingrese un id válido...!!!`})
  }
  
  try {
    existe = await productManagerMongo.getProductByIdMongo(pid)
  } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(500).json({error:`error inesperado en el servidor -Intente mas tarde`, detalle: error.message});
  }

 
  
  if(!existe){
    res.setHeader('Content-Type','application/json');
    return res.status(400).json({error:`No existe producto con id ${pid}`});
  }

  let{_id,title,description,price, thumbnail, code, stock , category,status} = existe 
//   Buscamos los id de los carritos actuales

  let carts = [];
  try {
    carts = await cartManagerMongo.getCartsMongo();
  } catch (error) {
    console.log(error.messsage);
  }

  return res.status(200).render('homepagemongoproduct',{_id,title,description,price, thumbnail, code, stock , category,status, carts});  
  }

)

router.get('/carts/:cid',  async (req,res)=>{ // para mostra solo los productos de carrito pasado por query.params 

    let { cid } = req.params;

  //se aplica return al obtener error
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



  let carrito

  //Buscamos los productos del carrito
  try {
 

    // Obtener el carrito por su ID
    let carrito = await cartsModelo.findById({deleted:false, _id:cid}).populate('products.productId');

    // console.log(carrito)

    if (!carrito) {
      return res.status(404).send('Carrito no encontrado');
    }

    // Renderizar la vista con los productos del carrito
    res.render('cartpage', { carrito });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
  

  

})



//*******PARTE DE LOGIN */



router.get('/registro', (req,res)=>{

let {error} = req.query

  
  res.setHeader('Content-Type','text/html')
  res.status(200).render('registro',{error, login:false})
})


router.get('/login', (req,res)=>{

  let {error, mensaje} = req.query

  
  res.setHeader('Content-Type','text/html')
  res.status(200).render('login', {error, mensaje, login:false})
})


router.get('/perfil', auth,(req,res)=>{
  res.setHeader('Content-Type','text/html')
  //Al pasar por el auth ya tenemos datos del usuario
  let usuario = req.user
  // console.log(usuario)



  
 
  res.status(200).render('perfil', {usuario, login:true})
})


//**Colocamos una nueva vista ADMIN para demostar que si ingresa al admin *****/
router.get('/admin', auth, (req,res)=>{

  //Al pasar por el auth ya tenemos datos del usuario
  let usuario = req.user



  
  res.setHeader('Content-Type','text/html')
  res.status(200).render('admin', {usuario, login:true})
})

//**Colocamos una nueva vista ADMIN para demostar que si ingresa al admin *****/