const mongoose = require("mongoose");

const solicitudNumeroSchema = new mongoose.Schema(
    {
        solicitud: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Solicitud",
            required: true
        },

        numero: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Numero",
            required: true
        },

        orden: {
            type: Number,
            required: true,
            min: 1
        },

        precioAplicado: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true,
        collection: "solicitud_numeros"
    }
);

// Un número no puede repetirse en la misma solicitud.
solicitudNumeroSchema.index(
    {
        solicitud: 1,
        numero: 1
    },
    {
        unique: true
    }
);

// Dos números no pueden ocupar la misma posición.
solicitudNumeroSchema.index(
    {
        solicitud: 1,
        orden: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    "SolicitudNumero",
    solicitudNumeroSchema
);