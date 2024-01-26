console.log("Este es el script de REALTIMEPRODUCTS");

const socket = io(); //FRONTEND

socket.on("nuevoProducto", (producto) => {
  let ulProductos = document.querySelector("ul");
  let nuevoProducto = document.createElement("li");
  nuevoProducto.innerHTML = `ID : ${producto.id} Producto: ${producto.title}`;
  nuevoProducto.setAttribute("id", `${producto.id}`);
  ulProductos.append(nuevoProducto);
});

socket.on("deleteProducto", (pid) => {
  console.log(pid);
  let numero = pid;
  let n = numero.toString();
  console.log(n);

  let lista = document.getElementById("lista1");
//   let numeroABorrar = document.getElementById(n)
  let numeroABorrar = document.getElementById(pid);

  console.log(lista);
  console.log(numeroABorrar);
  lista.removeChild(numeroABorrar)
});

// socket.on("nuevoProducto", producto=>{
//     let ulProductos = document.querySelector('ul');
//     let liNuevoProducto = document.createElement('li');
//     liNuevoProducto.innerHTML = producto;
//     ulProductos.append(liNuevoProducto)

// })
// socket.on("deleteProducto", pid=>{

//     let  lista1 = document.getElementById("lista1")

//     let liABorrar =lista1.querySelector("#pid")
//     console.log(liABorrar)

//     // console.log(pid)
//     // let li = Array.from(document.getElementsByTagName('li'))

//     // let liABorrar = li[pid];

//     // lista1.removeChild(liABorrar)

//     // const lista = document.querySelectorAll('li')[pid-1]
//     // lista.remove()

//     // console.log("El producto eliminado es el de la posicion:",pid)
//     // let id=parseInt(pid)
//     // let removProd = document.querySelectorAll('li')[id]
//     // removProd.remove();

// })

