const Solicitud = require("../models/Solicitud");

const MARGEN_HORAS = 5;
const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

function construirFechaHora(fecha, hora) {
    return new Date(`${fecha}T${hora}:00.000Z`);
}

async function buscarConflictoHorario({
    fecha,
    hora,
    excluirSolicitudId = null
}) {
    const inicioDia = new Date(`${fecha}T00:00:00.000Z`);
    const finDia = new Date(`${fecha}T23:59:59.999Z`);

    const filtro = {
        fechaEvento: {
            $gte: inicioDia,
            $lte: finDia
        },
        estado: "Aceptada"
    };

    if (excluirSolicitudId) {
        filtro._id = {
            $ne: excluirSolicitudId
        };
    }

    const solicitudesAceptadas = await Solicitud.find(filtro);

    const fechaHoraSolicitada = construirFechaHora(
        fecha,
        hora
    );

    return solicitudesAceptadas.find((solicitud) => {
        const fechaGuardada = solicitud.fechaEvento
            .toISOString()
            .slice(0, 10);

        const fechaHoraAceptada = construirFechaHora(
            fechaGuardada,
            solicitud.horaEvento
        );

        const diferencia =
            Math.abs(
                fechaHoraSolicitada.getTime() -
                fechaHoraAceptada.getTime()
            ) / MILISEGUNDOS_POR_HORA;

        return diferencia < MARGEN_HORAS;
    });
}

module.exports = {
    buscarConflictoHorario,
    MARGEN_HORAS
};