

console.log('Cargo chat.js....')

const socket = io() // inicializamos el chat con el cliente socket

let inputMensaje = document.getElementById('mensaje');
let divMensajes = document.getElementById('mensajes');

io
Swal.fire({
    title:"Identifiquese",
    input:"text",
    text:"Ingrese su nickname",
    inputValidator: (value)=>{
        // return !value && "Debe ingresar un nombre...!!!"
        if (!value) {
            return "Debe ingresar un email...!!!";
        } else {
            // Verificar si el valor tiene el formato de un email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return "Ingrese un email válido...!!!";
            }
        }

        
    },
    allowOutsideClick:false
}).then(resultado=>{
    console.log(resultado)
    socket.emit('id', resultado.value)
 
    inputMensaje.focus()
    document.title = resultado.value
    socket.on('nuevoUsuario', nombre=>{
        //POPUP TODO
        Swal.fire({
            text:`${nombre} se ha conectado...!!!`,
            toast:true,
            position:"top-right"
        })
    })



    
    inputMensaje.addEventListener("keyup", (e)=>{
        // console.log(e, e.target.value)
        if(e.code === "Enter" && e.target.value.trim().length>0){
            socket.emit('mensaje', {emisor: resultado.value , mensaje: e.target.value.trim()});
            e.target.value= ''
        }
    })

    
    socket.on('nuevoMensaje',  datos=>{
        let parrafo = document.createElement('p')
        parrafo.innerHTML= `<strong>${datos.emisor} </strong> dice:<i>${datos.mensaje}</i>`
       
    
        parrafo.classList.add('mensaje')
        let br = document.createElement('br')
        divMensajes.append(parrafo, br);
        divMensajes.scrollTop = divMensajes.scrollHeight; // Para que el scrool siempre se pueda ver al escribir mas elementos
    })

    socket.on('hello', mensajes=>{
        mensajes.forEach(mensaje => {
            let parrafo = document.createElement('p')
            parrafo.innerHTML= `<strong>${mensaje.emisor} </strong> dice:<i>${mensaje.mensaje}</i>`
            parrafo.classList.add('mensaje')
            let br = document.createElement('br')
            divMensajes.append(parrafo, br);
            divMensajes.scrollTop = divMensajes.scrollHeight; // Para que el scrool siempre se pueda ver al escribir mas elementos
        });
    })
    socket.on("usuarioDesconectado",nombre=>{
        Swal.fire({
            text:`${nombre} se ha desconectado...!!!`,
            toast:true,
            position:"top-right"
        })
    } )

   
})