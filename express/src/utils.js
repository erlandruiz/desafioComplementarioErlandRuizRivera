import {fileURLToPath} from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt' // importamos bcrypt Se coloca acá para poderle dar mantenimiento

import jwt from 'jsonwebtoken'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("import.meta.url: ",import.meta.url)
console.log("__filename: ", __filename)
console.log("__dirname: ", __dirname)

export default __dirname;

export const SECRETCODE = 'codercoder2024'

//****** Configuracion de bcrypt******/
export const creaHash = (password)=>bcrypt.hashSync(password, bcrypt.genSaltSync(10))//Palabras aleatorias que genera. tiene return implicito

export const validaPassword = (usuario, password)=>bcrypt.compareSync(password, usuario.password) 


//***End ***** Configuracion de bcrypt******/

export const generaToken = (usuario) => {
    try {
        const { _id, first_name, last_name, age, cartId, email, role } = usuario;
        return jwt.sign({ _id, first_name, last_name, age, cartId, email, role }, SECRETCODE, { expiresIn: "1h" });
    } catch (error) {
        console.error('Error generando el token:', error);
    }
};


export const auth = (req,res,next)=>{
    if(!req.cookies.ecommerceCoder){
        res.setHeader('Content-Type', 'application(json')
        return res.redirect('/login')
    }
    let token = req.cookies.ecommerceCoder
    try {
        let user = jwt.verify(token, SECRETCODE)
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({error})
    }
}