const mongoose = require("mongoose");

const artistaSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 100
        },

        tecnicas: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Numero"
            }
        ],

        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "artistas"
    }
);

module.exports = mongoose.model("Artista", artistaSchema);