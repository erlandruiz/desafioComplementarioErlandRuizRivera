import mongoose  from "mongoose";

const usersEsquema = new mongoose.Schema(
    {

          //***********Viendo el video clase 17*********MongoAvanzado1***** */
     
        first_name:String,
        last_name:String,
        email:{
            type:String,
            unique: true
        },
        age:Number,
        password: String,
        role:{
            type:String,
            default: "user"
        },
        cartId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'carts'
        },
        deleted: {
            type: Boolean,
            default: false,
          }, //para DELETE LOGICO

    },

    {
        timestamps: true, //Deja la marca de tiempo cuando  grabas el dato, FECHA DE  CREACION , FECHA DE MODIFICACION
        
        strict: false, //sirve para agregar propiedades que no estan definidas dentro el esquema , cuando esta en false se pueden agregar
        //Colocamos tambien el strict en false para poder guardar los datos de profile de Github
      }
)

//Este es un equemas corto solo para findone
usersEsquema.pre("findOne", function () {
    this.populate({
        path: 'cartId'
    }).lean()
})

//Este es un equemas corto solo para find
usersEsquema.pre("find", function () {
    this.populate({
       path: 'cartId' 
    }).lean() 
})

export const usersModel = mongoose.model('users', usersEsquema)