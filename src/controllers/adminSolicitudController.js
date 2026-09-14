const Artista = require("../models/Artista");

const {
    buscarConflictoHorario
} = require("../services/disponibilidad");

const Solicitud = require("../models/Solicitud");
const SolicitudNumero = require("../models/SolicitudNumero");

async function listarSolicitudes(req, res) {
    try {
        const solicitudes = await Solicitud.find()
            .sort({ createdAt: -1 });

        res.render("panel-solicitudes", {
            titulo: "Solicitudes recibidas",
            solicitudes
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("No fue posible cargar las solicitudes.");
    }
}

async function verSolicitud(req, res) {
    try {
        const solicitud = await Solicitud.findById(
            req.params.id
        )
            .populate("gestionadaPor", "nombre correo")
            .populate("artistasSugeridos", "nombre")
            .populate("artistasAsignados", "nombre");

        if (!solicitud) {
            return res.status(404).send(
                "Solicitud no encontrada."
            );
        }

        const numerosSeleccionados =
            await SolicitudNumero.find({
                solicitud: solicitud._id
            })
                .populate("numero")
                .sort({ orden: 1 });

        const artistasDisponibles = await Artista.find({
                activo: true
            }).sort({ nombre: 1 });

        res.render("panel-solicitud-detalle", {
            titulo: "Detalle de solicitud",
            solicitud,
            numerosSeleccionados,
            artistasDisponibles,
            error: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "No fue posible consultar la solicitud."
        );
    }
}

async function gestionarSolicitud(req, res) {
    try {
        const solicitud = await Solicitud.findById(
            req.params.id
        );

        if (!solicitud) {
            return res.status(404).send(
                "Solicitud no encontrada."
            );
        }

        const estadosPermitidos = [
            "Aceptada",
            "Rechazada"
        ];

        if (!estadosPermitidos.includes(req.body.estado)) {
            return res.status(400).send(
                "El estado seleccionado no es válido."
            );
        }

        if (req.body.estado === "Aceptada") {
            const fecha = solicitud.fechaEvento
            .toISOString()
            .slice(0, 10);

        const conflicto = await buscarConflictoHorario({
            fecha,
            hora: solicitud.horaEvento,
            excluirSolicitudId: solicitud._id
        });

            if (conflicto) {
                const numerosSeleccionados =
                    await SolicitudNumero.find({
                        solicitud: solicitud._id
                    })
                        .populate("numero")
                        .sort({ orden: 1 });

                await solicitud.populate(
                    "artistasSugeridos",
                    "nombre"
                );

                const artistasDisponibles = await Artista.find({
    activo: true
}).sort({ nombre: 1 });

                return res.status(409).render(
                    "panel-solicitud-detalle",
                    {
                        titulo: "Detalle de solicitud",
                        solicitud,
                        numerosSeleccionados,
                        artistasDisponibles,
                        error:
                            "No se puede aceptar esta solicitud porque existe otra presentación aceptada con menos de cinco horas de separación."
                    }
                );
            }
        }

        let artistasSeleccionados =
    req.body.artistasAsignados || [];

if (!Array.isArray(artistasSeleccionados)) {
    artistasSeleccionados = [artistasSeleccionados];
}

if (
    req.body.estado === "Aceptada" &&
    artistasSeleccionados.length === 0
) {
    return res.status(400).send(
        "Debes asignar al menos un artista antes de aceptar la solicitud."
    );
}

const artistasValidos = await Artista.find({
    _id: {
        $in: artistasSeleccionados
    },
    activo: true
});

if (
    req.body.estado === "Aceptada" &&
    artistasValidos.length !== artistasSeleccionados.length
) {
    return res.status(400).send(
        "Uno o más artistas seleccionados no son válidos."
    );
}
        
        solicitud.estado = req.body.estado;

        solicitud.cotizacionFinal =
            Number(req.body.cotizacionFinal) ||
            solicitud.cotizacionEstimada;

        solicitud.observacionesCotizacion =
            req.body.observacionesCotizacion?.trim() || "";

        solicitud.gestionadaPor =
            req.session.usuario.id;

       solicitud.artistasAsignados =
    req.body.estado === "Aceptada"
        ? artistasValidos.map((artista) => artista._id)
        : [];     

        await solicitud.save();

        res.redirect(
            `/panel/solicitudes/${solicitud._id}`
        );
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "No fue posible gestionar la solicitud."
        );
    }
}

module.exports = {
    listarSolicitudes,
    verSolicitud,
    gestionarSolicitud
};