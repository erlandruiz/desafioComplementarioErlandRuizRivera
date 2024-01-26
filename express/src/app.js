//Se trabaja con ESC 6 utilizando import y export

import express, { urlencoded } from "express";

import { router as routerProducts } from "./routes/products.router.js";
import { router as routerCarts } from "./routes/carts.router.js";

import { join } from "path"; //Utilizamos el path para poder trabajar con rutas absolutas
import __dirname from "./utils.js"; //importo para crear una ruta absoluta de la carpeta public

import { engine } from "express-handlebars"; //para usar handlebars

import exphbs from "express-handlebars";
import { router as vistasRouter } from "./routes/vistas.router.js";

import { Server } from "socket.io"; //Importando socket io para trabajar con websockets


import mongoose from 'mongoose'; //Importamos Mongoose 
import { router as routerProductsMongo  } from "./routes/products.router.mongo.js"; // Para trabajar con mongo atlas products
import { router as routerCartsMongo} from "./routes/carts.router.mongo.js"; // Para trabajar con mongo atlas carts
import { messagesModelo } from "./dao/models/message.models.js";

//***Para trabajar con Login *//

import sessions from 'express-session'
import mongoStore from 'connect-mongo'
import { router as sessionRouter } from "./routes/session.router.js";

import cookieParser from "cookie-parser";

//***Para trabajar con passport *//
import { inicializarPassport } from "./config/config.passport.js"; // PASO 2 gregar las configuraciones a APP
import passport from "passport";// PASO 2
//**end *Para trabajar con passport *//

//************************ //
//Limpiamos la consola
console.clear();
//************************ //

const PORT = 8080;

const app = express();
app.use(cookieParser())

//Para usar las sessions
// app.use(sessions({
//   secret: "codercoder123",
//   resave: true,//fuerza que la session se grabe igual si no se ha modificado, se asegura que cuando realiza distintas peticiones pero ninguna realiza cambio en la session igual la session no se va a caer
//   saveUninitialized: true, //mantiene la session a pesar que no se ha guardado nada
//   // cookie: { secure: true }
//   store: mongoStore.create(
//       {
//           mongoUrl:'mongodb+srv://erland:41296348@atlascluster.ocwqyul.mongodb.net/?retryWrites=true&w=majority',
//           mongoOptions:{dbName:"ecommerce"},
//           ttl:3600 //Time to live
//       }
//   )
// }))


app.use(express.json());
app.use(urlencoded({ extended: true })); // Colocamos la siguiente linea de comandos para que el servidor pueda interpretar datos complejos

let archivoViews = join(__dirname, "./views");




//***Para trabajar con passport *//
inicializarPassport();  //PASO 2 en este archivo se definieron las estrategias  
app.use(passport.initialize());//PASO 2 //con esto indico al punto de entrada que vamos a inicializar y manejar sessiones con passport
// app.use(passport.session())//PASO 2

//**end *Para trabajar con passport *//




// app.engine('handlebars', engine({ //Colcamos esta instruccion para no tener problemas con los elementos Hidratados que vienen de mongoose
//     runtimeOptions: {
//         allowProtoPropertiesByDefault: true,
//         allowProtoMethodsByDefault: true,
//     },
// }));

//*** Configuración de Express Handlebars*/
// app.engine("handlebars", engine()); //Borro esta linea para usar el helper
// 
const hbs = exphbs.create({
  helpers: {
      ifEquals: function(arg1, arg2, options) {
          return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
      }
  }
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

//***End** Configuración de Express Handlebars*/




app.set("views", archivoViews);

let archivoPublic = join(__dirname, "/public");
app.use(express.static(archivoPublic)); //http://localhost:8080/assets/img/producto.jpg

app.use("/api/products", routerProducts); // Lo que llega a api/products me lo atienda productsRouter//



app.use("/api/productsmongo", routerProductsMongo);


app.use("/api/carts", routerCarts); // Lo que llega a api/carts me lo atienda cartsRouter//


app.use("/api/cartsmongo", routerCartsMongo); 

app.use("/", vistasRouter);

app.use('/api/sessions', sessionRouter) //Lo que llega  para /api/sessions me lo atienda session.ruter.js

const server = app.listen(PORT, () => {
  console.log(`Server on line en puerto ${PORT}`);
});

let usuarios = [];
let mensajes = []; 



export const io = new Server(server); // Da inicio a socket.io BACKEND

io.on("connection", (socket) => {
  console.log(`se conecto un cliente con id ${socket.id}`);


 //CHAT
 socket.on('id', async nombre=>{ // recibe con on el socket id
  usuarios.push({nombre, id:socket.id})


  

  
  socket.broadcast.emit('nuevoUsuario', nombre) //emite a todos menos al que lo envia
  socket.emit("hello", mensajes)
});

socket.on('mensaje',  async datos=>{
  mensajes.push(datos);
  io.emit('nuevoMensaje', datos)



  let nuevoMensaje = {
    mensaje: datos.mensaje
  }
// para buscar y si existe el usuario  solo agrega el mensaje al array de mensajes
  await messagesModelo.findOneAndUpdate(
    {usuario: datos.emisor},
    {
      $push: { mensajes: nuevoMensaje}
    },
    { upsert: true, new: true },
  
  );


socket.on("disconnect", ()=>{
  let usuario = usuarios.find(u=>u.id === socket.id)
  if (usuario) {
      io.emit("usuarioDesconectado", usuario.nombre)
  }
})


});

})
//MOGOSOOSE genera conexion a la base datos ATLAS

try {
  await mongoose.connect('mongodb+srv://erland:41296348@atlascluster.ocwqyul.mongodb.net/?retryWrites=true&w=majority', {dbName: 'ecommerce'})
  console.log('DB Online......!!!!')
} catch (error) {
  console.log(error.message)
}

