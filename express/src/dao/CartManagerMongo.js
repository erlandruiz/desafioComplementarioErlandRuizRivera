import { ProductManagerMongo } from "./ProductManagerMongo.js";
import { cartsModelo } from "./models/carts.model.js";

const productManagerMongo2 = new ProductManagerMongo

export class CartManagerMongo{
      //Consigue los carts  del MONGO ATLAS
  async getCartsMongo() {
    try {
      return await cartsModelo.find({ deleted: false }).lean();
    } catch (error) {
      console.log(error.messsage);
      return null;
    }
  }


  //Consigue un carts con su respectivo ID
  async getCartsByIdMongo(cid){
  try {
    return await cartsModelo.findOne({deleted: false, _id:cid}).lean()
  } catch (error) {
    console.log(error.messsage);
      return null;
  }
  }


  //Agregar un cart al Atlas Mongo
  async addCartMongo(products) {
    try {
      // console.log('desde el addCartMongo', products)
  return await cartsModelo.create({products})
      
    } catch (error) {
      console.log(error.messsage);
      return null;
    }




  }


}