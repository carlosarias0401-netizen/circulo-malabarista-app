const mongoose = require("mongoose");

const numeroSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 100
        },

        categoria: {
            type: String,
            required: true,
            enum: [
                "Malabarismo",
                "Equilibrismo",
                "Animación",
                "Fuego",
                "Otra"
            ]
        },

        descripcion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        precioBase: {
            type: Number,
            required: true,
            min: 0
        },

        recursoUnico: {
            type: Boolean,
            default: false
        },

        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "numeros"
    }
);

module.exports = mongoose.model("Numero", numeroSchema);