const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        correo: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        contrasena: {
            type: String,
            required: true,
            minlength: 8
        },

        rol: {
            type: String,
            required: true,
            enum: ["Administrador", "Integrante"]
        },

        estado: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "usuarios"
    }
);

usuarioSchema.pre("save", async function () {
    if (!this.isModified("contrasena")) {
        return;
    }

    this.contrasena = await bcrypt.hash(this.contrasena, 12);
});

usuarioSchema.methods.comprobarContrasena = async function (contrasenaIngresada) {
    return bcrypt.compare(contrasenaIngresada, this.contrasena);
};

module.exports = mongoose.model("Usuario", usuarioSchema);