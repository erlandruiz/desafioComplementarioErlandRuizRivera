import { messagesModelo } from "./models/message.models";



export class MessageManagerMongo {

  //Consigue los mensajes  del MONGO ATLAS
  async getMessagesMongo() {
    try {
      return await messagesModelo.find({ deleted: false }).lean();
    } catch (error) {
      console.log(error.messsage);
      return null;
    }
  }


  //Agregar un mensaje al Mongo Atlas
  async addMessageMongo(
    user,
    message,
   
  ) {



    try {
        let mensaje = {
           
            user: user,
            message: message,
          
          };

       let nuevoMensaje = await messagesModelo.create(mensaje)
              ;

                return nuevoMensaje
    } catch (error) {
          
                console.log(`error inesperado en el servidor -Intente mas tarde`, error.message)
                return error.mensaje
    }

   
  }


//   async updateProductMongo(id, objeto) {

//     return await productsModelo.updateOne({deleted:false, _id:id}, objeto)

    
   
//   }

//   async delProductMongo(id) {
//     return await productsModelo.updateOne({deleted:false, _id:id},{$set:{deleted:true}})
//   }



}
