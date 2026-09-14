const dns = require("node:dns");
const mongoose = require("mongoose");

async function conectarBaseDatos() {
    try {
        if (process.env.DNS_SERVER) {
            dns.setServers([process.env.DNS_SERVER]);
        }

        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Conexión exitosa con MongoDB Atlas");
    } catch (error) {
        console.error("Error al conectar con MongoDB:");
        console.error(error.message);

        process.exit(1);
    }
}

module.exports = conectarBaseDatos;