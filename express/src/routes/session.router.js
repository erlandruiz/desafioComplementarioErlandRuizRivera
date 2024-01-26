import { Router } from "express";
import { usuariosModelo } from "../dao/models/usuarios.modelo.js";


import { creaHash, generaToken, validaPassword } from "../utils.js"; //trae el crea hash de utils.js


import passport from "passport"; //PASO 3
export const router = Router();



// router.get("/errorLogin", (req, res) => {
//   return res.redirect("/login?error=Error en el proceso de login...  :(");
// });

router.post("/login",(req,res,next)=>{

  passport.authenticate("login", {session:false}, (err, user,info)=>{
    if (err) {
      return next(err);
  }
  if (!user) {
      return res.redirect('/login?error=' + info.message);
  }
  const token = generaToken(user);
  res.cookie("ecommerceCoder", token, { maxAge: 1000 * 60 * 60, httpOnly: true });



  res.redirect('/perfil');
  })(req,res,next)

});



router.post("/registro", (req,res,next)=>{
    passport.authenticate("registro", { session: false },(err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("/registro?error=" + info.message);
      }
      let email = user.email;
      res.redirect(`/login?mensaje=Usuario ${email} registrado correctamente`); //PASO3  passport
    })(req,res,next)
  });

  router.get('/logout', (req,res)=>{
    res.clearCookie("ecommerceCoder");
    res.redirect('/login')
})



//****session de github */

router.get("/github", passport.authenticate("github", {session:false}), (req, res) => {
  //colocamos passport.authenticate('github' el mismo nombre del passport.use que esta en config.passport.js con ese se asocia
});

router.get("/callbackGithub",passport.authenticate("github", {failureRedirect: "/login", session:false
  }),
  (req, res) => {

    const token = generaToken(req.user)
    res.cookie("ecommerceCoder", token, {maxAge:1000*60*60, httpOnly:true})

   
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      // en base a la necesidad, ponemos lo que deseamos( si tenemos una lista redireccionaremos )
      message: "Acceso ok ...!!!",
      usuario: req.user,
    });
  }
);

// router.get("/errorGithub", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   res.status(200).json({
//     error: "Error al autenticar con Github",
//   });
// });

//**end **session de github */


router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
  res.json({ user: req.user });
});
