require("dotenv").config();

const mongoose = require("mongoose");

const conectarBaseDatos = require("../src/config/database");
const Numero = require("../src/models/Numero");

const numerosIniciales = [
    {
        nombre: "Pelotas",
        categoria: "Malabarismo",
        descripcion: "Número de malabarismo con pelotas.",
        precioBase: 15000,
        recursoUnico: false
    },
    {
        nombre: "Clavas",
        categoria: "Malabarismo",
        descripcion: "Número de malabarismo con clavas.",
        precioBase: 15000,
        recursoUnico: false
    },
    {
        nombre: "Rola bola",
        categoria: "Equilibrismo",
        descripcion: "Número de equilibrio sobre tabla y cilindro.",
        precioBase: 30000,
        recursoUnico: true
    },
    {
        nombre: "Diábolo",
        categoria: "Malabarismo",
        descripcion: "Número circense realizado con diábolo.",
        precioBase: 20000,
        recursoUnico: true
    },
    {
        nombre: "Hula hula",
        categoria: "Malabarismo",
        descripcion: "Número artístico con uno o varios aros.",
        precioBase: 20000,
        recursoUnico: true
    },
    {
        nombre: "Trompo",
        categoria: "Malabarismo",
        descripcion: "Número de manipulación y destreza con trompo.",
        precioBase: 20000,
        recursoUnico: true
    },
    {
        nombre: "Payaso",
        categoria: "Animación",
        descripcion: "Número de clown y animación para el público.",
        precioBase: 25000,
        recursoUnico: true
    },
    {
        nombre: "Antorchas",
        categoria: "Fuego",
        descripcion: "Número de malabarismo con antorchas encendidas.",
        precioBase: 30000,
        recursoUnico: false
    }
];

async function cargarNumeros() {
    try {
        await conectarBaseDatos();

        for (const numero of numerosIniciales) {
            const existente = await Numero.findOne({
                nombre: numero.nombre
            });

            if (existente) {
                console.log(`Ya existe: ${numero.nombre}`);
                continue;
            }

            await Numero.create(numero);
            console.log(`Número creado: ${numero.nombre}`);
        }

        console.log("Catálogo inicial creado correctamente");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("No fue posible crear el catálogo:");
        console.error(error.message);

        await mongoose.disconnect();
        process.exit(1);
    }
}

cargarNumeros();