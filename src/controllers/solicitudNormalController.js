const {
    buscarConflictoHorario
} = require("../services/disponibilidad");

const crypto = require("node:crypto");

const Solicitud = require("../models/Solicitud");

const VALOR_MINIMO_ARTISTA = 35000;
const VALOR_SONIDISTA = 30000;
const RECARGO_CADA_30_MINUTOS = 10000;
const RECARGO_EVENTO_MASIVO = 15000;

function generarCodigoSeguimiento() {
    const fecha = new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll("-", "");

    const aleatorio = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `CM-${fecha}-${aleatorio}`;
}

function calcularCotizacionNormal({
    cantidadArtistas,
    duracionMinutos,
    cantidadAsistentes
}) {
    const valorArtistas =
        Number(cantidadArtistas) * VALOR_MINIMO_ARTISTA;

    const bloquesAdicionales = Math.max(
        0,
        Math.ceil((Number(duracionMinutos) - 60) / 30)
    );

    const recargoDuracion =
        bloquesAdicionales * RECARGO_CADA_30_MINUTOS;

    const recargoAsistentes =
        Number(cantidadAsistentes) > 200
            ? RECARGO_EVENTO_MASIVO
            : 0;

    return (
        valorArtistas +
        VALOR_SONIDISTA +
        recargoDuracion +
        recargoAsistentes
    );
}

function mostrarSelector(req, res) {
    res.render("solicitud-tipos", {
        titulo: "Seleccionar modalidad"
    });
}

function mostrarFormularioNormal(req, res) {
    res.render("solicitud-normal", {
        titulo: "Solicitud normal",
        error: null,
        datos: {}
    });
}

async function registrarSolicitudNormal(req, res) {
    try {
        const camposObligatorios = [
            req.body.nombreCliente,
            req.body.correoCliente,
            req.body.telefonoCliente,
            req.body.tipoEvento,
            req.body.fechaEvento,
            req.body.horaEvento,
            req.body.comuna,
            req.body.lugarEvento,
            req.body.duracionMinutos,
            req.body.cantidadAsistentes,
            req.body.cantidadArtistas,
            req.body.preferenciaArtistica
        ];

        if (
            camposObligatorios.some((campo) => !campo) ||
            req.body.aceptaCondiciones !== "on"
        ) {
            return res.status(400).render("solicitud-normal", {
                titulo: "Solicitud normal",
                error:
                    "Completa todos los campos obligatorios y acepta las condiciones.",
                datos: req.body
            });
        }

        const fechaEvento = new Date(
            `${req.body.fechaEvento}T${req.body.horaEvento}:00`
        );


        if (
            Number.isNaN(fechaEvento.getTime()) ||
            fechaEvento <= new Date()
        ) {
            return res.status(400).render("solicitud-normal", {
                titulo: "Solicitud normal",
                error:
                    "Selecciona una fecha y una hora futuras válidas.",
                datos: req.body
            });
        }

        const horarioOcupado = await buscarConflictoHorario({
            fecha: req.body.fechaEvento,
            hora: req.body.horaEvento
        });

        if (horarioOcupado) {
            return res.status(409).render("solicitud-normal", {
                titulo: "Solicitud normal",
                error:
                    "El horario no está disponible. Debe existir una separación mínima de cinco horas respecto de las presentaciones aceptadas.",
                datos: req.body
            });
        }

        const cotizacionEstimada =
            calcularCotizacionNormal({
                cantidadArtistas: req.body.cantidadArtistas,
                duracionMinutos: req.body.duracionMinutos,
                cantidadAsistentes:
                    req.body.cantidadAsistentes
            });

        const solicitud = await Solicitud.create({
            codigoSeguimiento: generarCodigoSeguimiento(),
            tipoSolicitud: "Normal",
            nombreCliente: req.body.nombreCliente,
            correoCliente: req.body.correoCliente,
            telefonoCliente: req.body.telefonoCliente,
            tipoEvento: req.body.tipoEvento,
            fechaEvento: req.body.fechaEvento,
            horaEvento: req.body.horaEvento,
            comuna: req.body.comuna,
            lugarEvento: req.body.lugarEvento,
            duracionMinutos: Number(
                req.body.duracionMinutos
            ),
            cantidadAsistentes: Number(
                req.body.cantidadAsistentes
            ),
            cantidadArtistas: Number(
                req.body.cantidadArtistas
            ),
            preferenciaArtistica:
                req.body.preferenciaArtistica,
            cuentaAmplificacion:
                req.body.cuentaAmplificacion === "on",
            observaciones: req.body.observaciones || "",
            aceptaCondiciones: true,
            cotizacionEstimada
        });

        res.redirect(
            `/solicitudes/confirmacion/${solicitud.codigoSeguimiento}`
        );
    } catch (error) {
        console.error(error);

        res.status(500).render("solicitud-normal", {
            titulo: "Solicitud normal",
            error:
                "No fue posible registrar la solicitud. Intenta nuevamente.",
            datos: req.body
        });
    }
}

module.exports = {
    mostrarSelector,
    mostrarFormularioNormal,
    registrarSolicitudNormal
};