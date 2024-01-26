import mongoose from "mongoose";

const usuariosEsquema=new mongoose.Schema(
    {
        nombre: String,
        email: {
            type: String, unique: true
        },
        password: String,

        //**Creamos este rol para trabajar con rol de usuario *****/
        rol: { type: String, default: 'usuario' } // Se establece 'usuario' como rol predeterminado
          //******end ********Creamos este rol para trabajar con rol de usuario ******/
    },
    {
        strict:false,
        timestamps: {
            updatedAt: "FechaUltMod", createdAt: "FechaAlta"
        }
    }
)

export const usuariosModelo=mongoose.model("usuarios", usuariosEsquema)