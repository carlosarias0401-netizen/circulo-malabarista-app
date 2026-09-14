require("dotenv").config();

const mongoose = require("mongoose");

const conectarBaseDatos = require("../src/config/database");
const Usuario = require("../src/models/Usuario");

async function crearUsuarioInicial(datos) {
    const usuarioExistente = await Usuario.findOne({
        correo: datos.correo.toLowerCase()
    });

    if (usuarioExistente) {
        console.log(`La cuenta ${datos.correo} ya existe`);
        return;
    }

    await Usuario.create(datos);

    console.log(`Cuenta creada: ${datos.correo} - ${datos.rol}`);
}

async function cargarUsuarios() {
    try {
        await conectarBaseDatos();

        await crearUsuarioInicial({
            nombre: process.env.ADMIN_NOMBRE,
            correo: process.env.ADMIN_CORREO,
            contrasena: process.env.ADMIN_CONTRASENA,
            rol: "Administrador"
        });

        await crearUsuarioInicial({
            nombre: process.env.INTEGRANTE_NOMBRE,
            correo: process.env.INTEGRANTE_CORREO,
            contrasena: process.env.INTEGRANTE_CONTRASENA,
            rol: "Integrante"
        });

        console.log("Carga inicial finalizada");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("No fue posible crear los usuarios:");
        console.error(error.message);

        await mongoose.disconnect();
        process.exit(1);
    }
}

cargarUsuarios();