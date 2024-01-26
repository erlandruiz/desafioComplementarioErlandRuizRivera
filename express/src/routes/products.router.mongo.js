import { Router } from 'express';
import { productsModelo } from '../dao/models/products.model.js';
import mongoose from "mongoose";
import { ProductManagerMongo } from '../dao/ProductManagerMongo.js';



export const router=Router()

const productManagerMongo = new ProductManagerMongo()


// router.get('/products', async(req,res)=>{//Product antiguo

//   let productos = []
//   try {
    
//     productos = await productManagerMongo.getProductsMongo()
    
//   } catch (error) {
//     console.log(error.messsage)
//   }
  

//       res.setHeader('Content-Type','application/json');
//       return res.status(200).json({productos});
// })

//*****MIDDLEWARE PARA AUTO IDENTIFICACION */
const auth =(req, res, next)=>{ //USO del middleware // este midlewares esta asociado a la ruta de perfil
  if(!req.session.usuario){
     return  res.redirect('/login') //Obligatorio poner el return
  }

  next()
}

router.use(auth)

//***END**MIDDLEWARE PARA AUTO IDENTIFICACION */


router.get('/', async(req,res)=>{

  let pagina = 1
  if(req.query.pagina){  //capturamos el  valor de pagina 
    pagina= req.query.pagina 
    // console.log(pagina)
  }


  let limit =10;
  if(req.query.limit){  //capturamos el  valor de limit 
    limit = req.query.limit
    // console.log(limit)
  }




  let query = {};
  

  // Verifica si se proporciona el parámetro de consulta 'querydata'
  if (req.query.querydata) {
    // Asigna el valor de 'querydata' al campo 'category' en el objeto de consulta
    
    query = { category: req.query.querydata };
    console.log(query);
  }
  // http://localhost:8080/api/productsmongo?querydata=computo

  // http://localhost:8080/api/productsmongo?limit=3
  // http://localhost:8080/api/productsmongo?limit=3&pagina=2
  // http://localhost:8080/api/productsmongo?limit=3&pagina=2&sort=-1

  let sortDirection = req.query.sort === '1' ? 1 : req.query.sort === '-1' ? -1 : undefined;  //Capturamos el valor de Sort 

  let sortOptions = sortDirection ? { price: sortDirection } : undefined;//sortDirection evalúa el valor de req.query.sort y asigna el valor adecuado a sortOptions. Si req.query.sort es '1', se ordenará ascendente; si es '-1', se ordenará descendente; y si no llega ningún valor, no se aplicará ordenación.

        let productos 
        try {
          
          productos = await productsModelo.paginate(query, {lean: true, limit:limit, page:pagina, sort: sortOptions})
          // productos = await productsModelo.paginate({}, {lean: true, limit:limit, page:pagina, sort: sortOptions})
  
          
        } catch (error) {
          console.log(error.messsage)
          productos = []
        }
        

        let {totalPages, page,  hasPrevPage, hasNextPage, prevPage, nextPage, totalDocs} = productos

        // console.log(totalPages, hasPrevPage, hasNextPage, prevPage, nextPage, totalDocs)
         
        let prevLink, nextLink // agregamos los enlaces de pagina 
        //usamos ternario 
        (hasPrevPage) ? prevLink =`http://localhost:8080/api/productsmongo?limit=${limit}&pagina=${prevPage}&sort=${sortDirection}`  : prevLink=null;
        (hasNextPage) ? nextLink =`http://localhost:8080/api/productsmongo?limit=${limit}&pagina=${nextPage}&sort=${sortDirection}`  : nextLink=null;

          res.setHeader('Content-Type','application/json');
          return res.status(200).json({
            status:'success',
            payload:productos.docs,
             limit, sortDirection, query, pagina, totalPages,page, totalDocs, hasPrevPage, hasNextPage, prevPage, nextPage, prevLink, nextLink});
        // res.status(200).render('homepagemongo',{productos:productos.docs, limit, sortDirection, totalPages,page , hasPrevPage, hasNextPage, prevPage, nextPage});
})

router.get('/:pid', async(req,res)=>{
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

res.setHeader('Content-Type','application/json');
return res.status(200).json({producto:existe });


})



router.post('/',async (req,res)=>{//Post agrega datos
  let {
      title,
      description,
      price,
      thumbnail = [],
      code,
      stock,
      category,
      status,
    } = req.body;

    if (!title || !description || !price || !code || !stock || !category) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({
        error: `Los datos title, description, price, code, stock , category y status son obligatorios`,
      });
    }

    let existeCode = false;

    try {
      existeCode = await productsModelo.findOne({deleted:false, code:code}).lean()
    } catch (error) {
      res.setHeader('Content-Type','application/json');
            return res.status(500).json({error:`error inesperado en el servidor -Intente mas tarde`, detalle: error.message});
    }

    if (existeCode) {
      res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`El producto con code ${code} ya existe en BD..........`});
    }

    try {

      let resultado =  await productManagerMongo.addProductMongo(title, description,price, thumbnail, code, stock, category, status)
      res.setHeader('Content-Type','application/json');
                return res.status(200).json({payload: resultado});
      
    } catch (error) {
      res.setHeader('Content-Type','application/json');
      return res.status(500).json({error:`error inesperado en el servidor -Intente mas tarde`, detalle: error.message});
    }

  //  let resultado =  await productManagerMongo.addProductMongo(title, description,price, thumbnail, code, stock, category, status)
 
  

  // if (!resultado) {
  //   res.setHeader('Content-Type','application/json');
  //   return res.status(400).json({error:`Se ha producido un error al agregar el producto`});
  // } else {
  // //   //** IO */
  
  // //    io.emit("nuevoProducto", resultado) //Damos inicio al IO
    
  // //  //** IO */
  //  res.setHeader("Content-Type", "application/json");
  //  return res.status(200).json({message:'Producto Agregado', resultado });
    
  // }

  
  

   
})


router.put('/:pid', async (req,res )=>{
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

  //Valida si intenta modificar el id y el code
  if(req.body._id || req.body.code){
          res.setHeader('Content-Type','application/json');
          return res.status(400).json({error:`No se pueden modificar las propiedades "_id" y "code" `});
  }
  let resultado 
  
  try {
      resultado = await productManagerMongo.updateProductMongo(pid, req.body )
      // resultado = await usuariosModelo.updateOne({deleted:false, _id:id}, {$set:{codigo:'999'}, $inc:{edad:5}})
      // console.log(resultado)
      if (resultado.modifiedCount>0) { // Con esta instruccion se verifica que se modifico.
          res.setHeader('Content-Type','application/json');
          return res.status(200).json({payload: "Modificación realizada"});
          
      }else{
              res.setHeader('Content-Type','application/json');
              return res.status(400).json({error:`No se concretó la modificación`});
      }
        

      
  } catch (error) {
          res.setHeader('Content-Type','application/json');
          return res.status(500).json({error:`error inesperado en el servidor -Intente mas tarde`, detalle: error.message});
  }

 


})



router.delete('/:pid', async (req,res )=>{
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

  let resultado 
  
  try {
   
      resultado = await productManagerMongo.delProductMongo(pid)
      // console.log(resultado)
      if (resultado.modifiedCount>0) { // Con esta instruccion se verifica que se modifico.
          res.setHeader('Content-Type','application/json');
          return res.status(200).json({payload: "Producto eliminado"});
          
      }else{
              res.setHeader('Content-Type','application/json');
              return res.status(400).json({error:`No se concretó la eliminación`});
      }
     
  } catch (error) {
          res.setHeader('Content-Type','application/json');
          return res.status(500).json({error:`error inesperado en el servidor -Intente mas tarde`, detalle: error.message});
  }


})
