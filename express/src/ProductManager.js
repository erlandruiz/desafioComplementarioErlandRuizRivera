//Se trabaja con ESC 6 utilizando import y export

//Agregando File System para trabajar con archivos

import { existsSync, promises } from "fs";

//************************ //
//Limpiamos la consola
console.clear();
//************************ //

export class ProductManager {
  constructor(rutaArchivo) {
    this.path = rutaArchivo;
  }

  //Consigue los productos del FS en modo asyncrono
  async getProductsAsyncFS() {
    if (existsSync(this.path)) {
      return JSON.parse(await promises.readFile(this.path, "utf-8"));
    } else {
      return [];
    }
  }

  //Agregar un producto al FS en modo asyncrono
  async addProductAsyncFS(
    title,
    description,
    price,
    thumbnail = [],
    code,
    stock,
    category,
    status = true
  ) {

    try {
      let productos = await this.getProductsAsyncFS();

    // validar si el code existe
    let existeCode = productos.find((producto) => {
      return producto.code === code;
    });
   
    let id = 1;

    if (productos.length > 0) {
      id = productos[productos.length - 1].id + 1;
    }

    let producto = {
      id: id,
      title: title,
      description: description,
      price: price,
      thumbnail: thumbnail,
      code: code,
      stock: stock,
      category: category,
      status: status,
    };

    if (existeCode) {
      console.log(`El usuario con code = ${code} ya existe`);
      return ;
    }else{
      productos.push(producto);
      await promises.writeFile(this.path, JSON.stringify(productos, null, 5));
      return producto;
    }

     
    } catch (error) {
      console.log(`Se ha producido un error al agregar el producto  `)
      throw new Error(`Se ha producido un error al agregar el producto `)
    }
    
  }

  //retorno el producto por ID del FS en modo asyncrono
  async getProductByIdAsyncFS(id) {
    let productos = await this.getProductsAsyncFS();

    let indice = productos.findIndex((producto) => {
      return producto.id === id;
    });
    if (indice === -1) {
      console.log(`No existe el producto con id ${id}  Not Found`);
      return;
    }

    return productos[indice];
  }

  //Borrar un producto del FS en modo asyncrono

  async delProductAsyncFS(id) {
    try {
      let productos = await this.getProductsAsyncFS();

      //Buscando si existe el indice

      let indice = productos.findIndex((producto) => {
        return producto.id === id;
      });
      if (indice === -1) {
        console.log(`No existe el producto con id ${id}  Not Found`);
        return;
      } else {
        console.log(`El producto con ${id} se ha eliminado`);
        let productoeliminado = productos.splice(indice, 1);

        await promises.writeFile(this.path, JSON.stringify(productos, null, 5));
        return productoeliminado;
      }
    } catch (error) {
      console.log(`Se ha producido un error al borrar el producto con id ${id}`)
      throw new Error(`Se ha producido un error al borrar el producto con id ${id}`)
    }
  }

  //Actualizar un producto del  FS en modo asyncrono
  async updateProductAsyncFS(id, objeto) {
    let productos = await this.getProductsAsyncFS();

    //Buscando si existe el indice

    let indice = productos.findIndex((producto) => {
      return producto.id === id;
    });
    if (indice === -1) {
      console.log(`No existe el producto con id ${id}  Not Found`);
      return `No existe el producto con id ${id}  Not Found`;
    }

    //Validar que sea un objeto

    //*********************** //

    //Comprobando si es un objeto

    const comprobarObjeto = (obj) => {
      return obj === Object(obj);
    };

    const objetoComprobado = comprobarObjeto(objeto);

    if (!objetoComprobado) {
      console.log("no es un objeto");
      return;
    }

    //*********************** //

    //*********************** //
    //valida que un objeto no sea vacio

    const camposObjetosLlenos = (obj) => {
      if (Object.values(obj).length === 0) {
        console.log("Debe ingresar al menos un campo, con su valor ");
        return;
      }
    };

    camposObjetosLlenos(objeto);

    //*********************** //

    //*********************** //
    //valida que los campos a ingresar sean los correctos

    const claves = Object.keys(objeto);

    const clavesMaestras = Object.keys(productos[0]);

    try {
      claves.forEach((datoObjeto) => {
        let dato = clavesMaestras.includes(datoObjeto);

        if (!dato) {
          console.log(`NO EXISTE EL CAMPO ${datoObjeto}`);
          throw `Error de campo`;
          //  return false
        }
      });
    } catch (error) {
      console.log(error.message);
    }
    //*********************** //

    productos[indice] = {
      ...productos[indice],
      ...objeto,
      id,
    };

    await promises.writeFile(this.path, JSON.stringify(productos, null, 5));
    return productos[indice];
  }
}
