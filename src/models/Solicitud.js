const mongoose = require("mongoose");

const solicitudSchema = new mongoose.Schema(
    {
        codigoSeguimiento: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },

        tipoSolicitud: {
            type: String,
            required: true,
            enum: ["Normal", "Avanzada", "Comunitaria"]
        },

        nombreCliente: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        correoCliente: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            maxlength: 100
        },

        telefonoCliente: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        },

        nombreOrganizacion: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        tipoEvento: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        fechaEvento: {
            type: Date,
            required: true
        },

        horaEvento: {
            type: String,
            required: true
        },

        comuna: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        lugarEvento: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        duracionMinutos: {
            type: Number,
            required: true,
            min: 15,
            max: 240
        },

        cantidadAsistentes: {
            type: Number,
            required: true,
            min: 1
        },

        cantidadArtistas: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },

        artistasSugeridos: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artista"
    }
],

    artistasAsignados: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artista"
    }
],

        preferenciaArtistica: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ""
        },

        cuentaAmplificacion: {
            type: Boolean,
            default: false
        },

        observaciones: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        aceptaCondiciones: {
            type: Boolean,
            required: true
        },

        estado: {
            type: String,
            enum: [
                "Pendiente",
                "Aceptada",
                "Rechazada",
                "Cancelada"
            ],
            default: "Pendiente"
        },

        cotizacionEstimada: {
            type: Number,
            required: true,
            min: 0
        },

        cotizacionFinal: {
            type: Number,
            min: 0,
            default: null
        },

        observacionesCotizacion: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        gestionadaPor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            default: null
        }
    },
    {
        timestamps: true,
        collection: "solicitudes"
    }
);

module.exports = mongoose.model("Solicitud", solicitudSchema);