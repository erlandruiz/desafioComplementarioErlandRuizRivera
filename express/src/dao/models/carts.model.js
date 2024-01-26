import mongoose from "mongoose";

const cartsCollection = "carts";


const cartsEsquema = new mongoose.Schema(
  {



    //***********Viendo el video clase 17************** */
    products: {
    
     type:[
      {
        productId:{
          type: mongoose.Schema.Types.ObjectId,
          ref:   'products'
        },
        qty:Number
      }
     ]
    },






    deleted: {
      type: Boolean,
      default: false,
    }, //para DELETE LOGICO
  },

  {
    timestamps: true, //Deja la marca de tiempo cuando  grabas el dato, FECHA DE  CREACION , FECHA DE MODIFICACION
    //collection: 'BigUsers' para trabajar datos en plural
    strict: true, //sirve para agregar propiedades que no estan definidas dentro el esquema , cuando esta en false se pueden agregar
  }
);
cartsEsquema.pre('findOne', function(){
  this.populate(
    {path:'products.productId'}
  ).lean()
})
cartsEsquema.pre('find', function(){
  this.populate(
    {path:'products.productId'}
  ).lean()
})


export const cartsModelo = mongoose.model(cartsCollection, cartsEsquema);
