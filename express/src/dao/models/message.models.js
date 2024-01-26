import mongoose from "mongoose";

const messagesCollection = "mensaje";

const messagesEsquema = new mongoose.Schema(
  {
    usuario: String,



    mensajes: [
      { mensaje: String, 
        fecha: { type: Date, default: Date.now } 
      }
    ],

 
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

export const messagesModelo = mongoose.model(
  messagesCollection,
  messagesEsquema
);
