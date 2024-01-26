//Se trabaja con ESC 6 utilizando import y export



//Agregando File System para trabajar con archivos

import { existsSync, promises } from "fs";
import { ProductManager } from "./ProductManager.js";

import { join } from "path";//Utilizamos el path para poder trabajar con rutas absolutas
import __dirname from "../../utils2.js"; //Importamos utils para poder trabajar con rutas absolutas


let archivo = join(__dirname, "/archivos/products.json");
//************************ //
//Limpiamos la consola
console.clear();
//************************ //

const productManager2 = new ProductManager(archivo)

export class CartManager {
  constructor(rutaArchivo) {
    
    this.path = rutaArchivo;

  }

  //Consigue los carts del FS en modo asyncrono
  async getCartsAsyncFS() {
    if (existsSync(this.path)) {
      return JSON.parse( await promises.readFile(this.path, "utf-8"));
    } else {
      return [];
    }
  }

  //Agregar un cart al FS en modo asyncrono
  async addCartAsyncFS(products) {
    let carts = await this.getCartsAsyncFS();
    let productos = await productManager2.getProductsAsyncFS()

    console.log(products)
    let [data] = products;
    let productId = data.productId
    // console.log(productId)

    

    // validar si el id del producto  existe en el arrays de productos
    let existeProducto = productos.find((producto) => {
      return producto.id === productId;
    });
    if (!existeProducto) {
      console.log(`El usuario con producto = ${productId} no existe`);
      return;
    }

    let id = 1;

    if (carts.length > 0) {
      id = carts[carts.length - 1].id + 1;
    }

    let cart = {
      id:id,
      products: products
    };


    carts.push(cart);
    await promises.writeFile(this.path, JSON.stringify(carts, null, 5));
    return (cart)
  }


  async addCartProductAsyncFS(cid, pid, productAgregar) { // agrega solo el producto enviado por objeto
    let carts = await this.getCartsAsyncFS();
    // let productos = await productManager2.getProductsAsyncFS()

    let {productId, qty} = productAgregar
    console.log(productId);
    console.log(qty)
    console.log(productAgregar)
    

    

    let indice = carts.findIndex((cart)=>{// Buscamos un indice del carrito 
      return cart.id ===cid
    })

    console.log(indice)

    //comprobamos si el producto Existe

    let existeProduct = carts[indice].products.find((productoid)=>{
      return productoid.productId === pid
    })

    console.log(existeProduct)

    if (existeProduct) {
      existeProduct.qty += qty
    }else{
      carts[indice].products.push({
        productId:pid,
        qty:qty
      })
    }

    await promises.writeFile(this.path, JSON.stringify(carts, null, 5));
    return (carts)




    

    
  }


  //retorno el carts por ID del FS en modo asyncrono
  async getCartByIdAsyncFS(id) {
    let carts = await this.getCartsAsyncFS();

    let indice = carts.findIndex((cart) => {
      return cart.id === id;
    });
    if (indice === -1) {
      console.log(`No existe el cart con id ${id}  Not Found`);
      return ;
    }

    return carts[indice];
  }

}

