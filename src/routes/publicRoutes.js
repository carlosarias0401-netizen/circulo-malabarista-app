const express = require("express");

const {
    listarNumerosPublicos
} = require("../controllers/numeroController");

const {
    mostrarFormulario,
    registrarSolicitud,
    mostrarConfirmacion,
    obtenerRecomendacionArtistas
} = require("../controllers/solicitudController");

const {
    mostrarSelector,
    mostrarFormularioNormal,
    registrarSolicitudNormal
} = require("../controllers/solicitudNormalController");

const router = express.Router();

router.get("/numeros", listarNumerosPublicos);

router.get("/solicitudes/nueva", mostrarSelector);

router.get(
    "/solicitudes/normal",
    mostrarFormularioNormal
);

router.post(
    "/api/asignacion-artistas",
    obtenerRecomendacionArtistas
);

router.post(
    "/solicitudes/normal",
    registrarSolicitudNormal
);

router.get(
    "/solicitudes/confirmacion/:codigo",
    mostrarConfirmacion
);

router.get(
    "/solicitudes/avanzada",
    mostrarFormulario
);

router.post(
    "/solicitudes/avanzada",
    registrarSolicitud
);

router.get("/solicitudes/comunitaria", (req, res) => {
    res.send("Formulario de solicitud comunitaria en construcción");
});

module.exports = router;