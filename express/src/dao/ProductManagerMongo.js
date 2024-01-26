import { productsModelo } from "./models/products.model.js";


export class ProductManagerMongo {

  //Consigue los productos del MONGO ATLAS
  async getProductsMongo() {
    try {
      return await productsModelo.find({ deleted: false }).lean();
    } catch (error) {
      console.log(error.messsage);
      return null;
    }
  }

  //Consigue el pructo por ID de MOngo Atlas

  async getProductByIdMongo(id) {

    return await productsModelo.findOne({deleted:false, _id:id}).lean()
  
  }



  //Agregar un producto al Mongo Atlas
  async addProductMongo(
    title,
    description,
    price,
    thumbnail = [],
    code,
    stock,
    category,
    status = true
  ) {

    // let existeCode = false

    // try {
    //     existeCode = await productsModelo.findOne({deleted:false, code:code})
    // } catch (error) {
    //         // res.setHeader('Content-Type','application/json');
    //         // return res.status(500).json({error:`error inesperado en el servidor -Intente mas tarde`, detalle: error.message});

    //         console.log(`error inesperado en el servidor -Intente mas tarde`, error.message)
    //         return error.message
    // }

    // if (existeCode) {
    //     console.log(`El usuario con code = ${code} ya existe`);
    //     return ;
    // }


    try {
        let producto = {
           
            title: title,
            description: description,
            price: price,
            thumbnail: thumbnail,
            code: code,
            stock: stock,
            category: category,
            status: status,
          };

       let nuevoProducto = await productsModelo.create(producto)
                // res.setHeader('Content-Type','application/json');
                // return res.status(200).json({payload: nuevoProducto});

                return nuevoProducto
    } catch (error) {
                // res.setHeader('Content-Type','application/json');
                // return res.status(500).json({error:`error inesperado en el servidor -Intente mas tarde`, detalle: error.message});

                console.log(`error inesperado en el servidor -Intente mas tarde`, error.message)
                return error.mensaje
    }

   
  }


  async updateProductMongo(id, objeto) {

    return await productsModelo.updateOne({deleted:false, _id:id}, objeto)

    
   
  }

  async delProductMongo(id) {
    return await productsModelo.updateOne({deleted:false, _id:id},{$set:{deleted:true}})
  }



}
