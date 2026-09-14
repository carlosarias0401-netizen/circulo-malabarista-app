const express = require("express");

const {
    mostrarLogin,
    iniciarSesion,
    cerrarSesion
} = require("../controllers/authController");

const router = express.Router();

router.get("/login", mostrarLogin);
router.post("/login", iniciarSesion);
router.post("/logout", cerrarSesion);

module.exports = router;