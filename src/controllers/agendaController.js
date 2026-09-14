const Solicitud = require("../models/Solicitud");
const SolicitudNumero = require("../models/SolicitudNumero");

async function mostrarAgenda(req, res) {
    try {
        const solicitudes = await Solicitud.find({
            estado: "Aceptada"
        })
            .populate("artistasAsignados", "nombre")
            .sort({
                fechaEvento: 1,
                horaEvento: 1
            });

        const solicitudesConNumeros = await Promise.all(
            solicitudes.map(async (solicitud) => {
                const relaciones = await SolicitudNumero.find({
                    solicitud: solicitud._id
                })
                    .populate("numero", "nombre")
                    .sort({ orden: 1 });

                return {
                    solicitud,
                    numeros: relaciones.map(
                        (relacion) => relacion.numero.nombre
                    )
                };
            })
        );

        res.render("panel-agenda", {
            titulo: "Agenda de presentaciones",
            solicitudesConNumeros
        });
    } catch (error) {
        console.error(error);

        res.status(500).send(
            "No fue posible cargar la agenda."
        );
    }
}

module.exports = {
    mostrarAgenda
};