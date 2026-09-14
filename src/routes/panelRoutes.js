const express = require("express");

const {
    mostrarAgenda
} = require("../controllers/agendaController");

const {
    requerirAutenticacion,
    requerirRol
} = require("../middleware/autenticacion");

const {
    listarSolicitudes,
    verSolicitud,
    gestionarSolicitud
} = require("../controllers/adminSolicitudController");

const router = express.Router();

router.get(
    "/panel",
    requerirAutenticacion,
    (req, res) => {
        res.render("panel", {
            titulo: "Panel interno"
        });
    }
);

router.get(
    "/panel/solicitudes",
    requerirAutenticacion,
    listarSolicitudes
);

router.get(
    "/panel/solicitudes/:id",
    requerirAutenticacion,
    verSolicitud
);

router.post(
    "/panel/solicitudes/:id/estado",
    requerirRol("Administrador"),
    gestionarSolicitud
);

router.get(
    "/panel/agenda",
    requerirAutenticacion,
    mostrarAgenda
);

router.get(
    "/panel/administracion",
    requerirRol("Administrador"),
    (req, res) => {
        res.send("Acceso administrativo autorizado");
    }
);

module.exports = router;