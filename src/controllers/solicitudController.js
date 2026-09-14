const {
    buscarConflictoHorario
} = require("../services/disponibilidad");

const crypto = require("node:crypto");

const Numero = require("../models/Numero");
const Solicitud = require("../models/Solicitud");
const SolicitudNumero = require("../models/SolicitudNumero");

const {
    obtenerAsignacionMinima
} = require("../services/asignacionArtistas");

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

function normalizarSeleccion(valor) {
    if (!valor) {
        return [];
    }

    return Array.isArray(valor) ? valor : [valor];
}

function calcularCotizacion({
    numeros,
    cantidadArtistas,
    duracionMinutos,
    cantidadAsistentes
}) {
    const valorNumeros = numeros.reduce(
        (total, numero) => total + numero.precioBase,
        0
    );

    const minimoPorArtistas =
        Number(cantidadArtistas) * VALOR_MINIMO_ARTISTA;

    const valorArtistico = Math.max(
        valorNumeros,
        minimoPorArtistas
    );

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
        valorArtistico +
        VALOR_SONIDISTA +
        recargoDuracion +
        recargoAsistentes
    );
}

async function mostrarFormulario(req, res) {
    try {
        const numeros = await Numero.find({ activo: true })
            .sort({ categoria: 1, nombre: 1 });

        res.render("solicitud-formulario", {
            titulo: "Arma tu espectáculo",
            numeros,
            error: null,
            datos: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("No fue posible cargar el formulario.");
    }
}

async function registrarSolicitud(req, res) {
    let solicitudCreada = null;

    try {
        const numeros = await Numero.find({ activo: true })
            .sort({ categoria: 1, nombre: 1 });

        const idsSeleccionados = normalizarSeleccion(
            req.body.numeros
        );

        const camposObligatorios = [
            req.body.tipoSolicitud,
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
            req.body.cantidadArtistas
        ];

        if (
            camposObligatorios.some((campo) => !campo) ||
            idsSeleccionados.length === 0 ||
            req.body.aceptaCondiciones !== "on"
        ) {
            return res.status(400).render("solicitud-formulario", {
                titulo: "Solicitar presentación",
                numeros,
                error:
                    "Completa todos los campos obligatorios, selecciona al menos un número y acepta las condiciones.",
                datos: req.body
            });
        }

        if (
            req.body.tipoSolicitud === "Comunitaria" &&
            !req.body.nombreOrganizacion?.trim()
        ) {
            return res.status(400).render("solicitud-formulario", {
                titulo: "Solicitar presentación",
                numeros,
                error:
                    "La solicitud comunitaria requiere el nombre de la organización.",
                datos: req.body
            });
        }

        const fechaEvento = new Date(
    `${req.body.fechaEvento}T${req.body.horaEvento}:00`
);

const inicioDia = new Date(
    `${req.body.fechaEvento}T00:00:00`
);

const finDia = new Date(
    `${req.body.fechaEvento}T23:59:59.999`
);

if (
    Number.isNaN(fechaEvento.getTime()) ||
    Number.isNaN(inicioDia.getTime()) ||
    Number.isNaN(finDia.getTime()) ||
    fechaEvento <= new Date()
) {
    return res.status(400).render("solicitud-formulario", {
        titulo: "Solicitar presentación",
        numeros,
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
            return res.status(409).render("solicitud-formulario", {
                titulo: "Solicitar presentación",
                numeros,
                error:
                    "El horario no está disponible. Debe existir una separación mínima de cinco horas respecto de las presentaciones aceptadas.",
                datos: req.body
            });
        }

        const numerosEncontrados = await Numero.find({
            _id: { $in: idsSeleccionados },
            activo: true
        });

        if (numerosEncontrados.length !== idsSeleccionados.length) {
            return res.status(400).render("solicitud-formulario", {
                titulo: "Solicitar presentación",
                numeros,
                error:
                    "Uno o más números seleccionados no están disponibles.",
                datos: req.body
            });
        }

        const asignacionArtistas =
            await obtenerAsignacionMinima(idsSeleccionados);

        if (!asignacionArtistas) {
            return res.status(422).render(
                "solicitud-formulario",
                {
                    titulo: "Arma tu espectáculo",
                    numeros,
                    error:
                        "No existen suficientes artistas para realizar la combinación seleccionada.",
                    datos: req.body
                }
            );
        }

        const cotizacionEstimada = calcularCotizacion({
            numeros: numerosEncontrados,
            cantidadArtistas: asignacionArtistas.length,
            duracionMinutos: req.body.duracionMinutos,
            cantidadAsistentes: req.body.cantidadAsistentes
        });

        solicitudCreada = await Solicitud.create({
            codigoSeguimiento: generarCodigoSeguimiento(),
            tipoSolicitud: req.body.tipoSolicitud,
            nombreCliente: req.body.nombreCliente,
            correoCliente: req.body.correoCliente,
            telefonoCliente: req.body.telefonoCliente,
            nombreOrganizacion:
                req.body.nombreOrganizacion || "",
            tipoEvento: req.body.tipoEvento,
            fechaEvento: req.body.fechaEvento,
            horaEvento: req.body.horaEvento,
            comuna: req.body.comuna,
            lugarEvento: req.body.lugarEvento,
            duracionMinutos: Number(req.body.duracionMinutos),
            cantidadAsistentes: Number(
                req.body.cantidadAsistentes
            ),
            cantidadArtistas: asignacionArtistas.length,
            artistasSugeridos: asignacionArtistas.map(
                (artista) => artista._id
            ),
            cuentaAmplificacion:
                req.body.cuentaAmplificacion === "on",
            observaciones: req.body.observaciones || "",
            aceptaCondiciones: true,
            cotizacionEstimada
        });

        const idsOrdenados = [...idsSeleccionados].sort(
    (primerId, segundoId) => {
        const primerOrden = Number(
            req.body.ordenes?.[primerId] || 999
        );

        const segundoOrden = Number(
            req.body.ordenes?.[segundoId] || 999
        );

        return primerOrden - segundoOrden;
    }
);

const relaciones = idsOrdenados.map((numeroId, indice) => {
    const numero = numerosEncontrados.find(
        (elemento) =>
            elemento._id.toString() === numeroId
    );

    return {
        solicitud: solicitudCreada._id,
        numero: numero._id,
        orden: indice + 1,
        precioAplicado: numero.precioBase
    };
});

        await SolicitudNumero.insertMany(relaciones);

        res.redirect(
            `/solicitudes/confirmacion/${solicitudCreada.codigoSeguimiento}`
        );
    } catch (error) {
        console.error(error);

        if (solicitudCreada) {
            await SolicitudNumero.deleteMany({
                solicitud: solicitudCreada._id
            });

            await Solicitud.findByIdAndDelete(
                solicitudCreada._id
            );
        }

        res.status(500).send(
            "No fue posible registrar la solicitud."
        );
    }
}

async function mostrarConfirmacion(req, res) {
    try {
        const solicitud = await Solicitud.findOne({
            codigoSeguimiento: req.params.codigo
        });

        if (!solicitud) {
            return res.status(404).send("Solicitud no encontrada.");
        }

        const numerosSeleccionados = await SolicitudNumero.find({
            solicitud: solicitud._id
        })
            .populate("numero")
            .sort({ orden: 1 });

        res.render("solicitud-confirmacion", {
            titulo: "Solicitud registrada",
            solicitud,
            numerosSeleccionados
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("No fue posible consultar la solicitud.");
    }
}

async function obtenerRecomendacionArtistas(req, res) {
    try {
        const numeroIds = normalizarSeleccion(
            req.body.numeros
        );

        if (numeroIds.length === 0) {
            return res.json({
                disponible: true,
                cantidad: 0,
                artistas: []
            });
        }

        const asignacion = await obtenerAsignacionMinima(
            numeroIds
        );

        if (!asignacion) {
            return res.status(422).json({
                disponible: false,
                cantidad: 0,
                artistas: [],
                mensaje:
                    "La combinación seleccionada no puede ser cubierta por los artistas disponibles."
            });
        }

        res.json({
            disponible: true,
            cantidad: asignacion.length,
            artistas: asignacion.map(
                (artista) => artista.nombre
            )
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            disponible: false,
            mensaje:
                "No fue posible calcular los artistas necesarios."
        });
    }
}

module.exports = {
    mostrarFormulario,
    registrarSolicitud,
    mostrarConfirmacion,
    obtenerRecomendacionArtistas
};