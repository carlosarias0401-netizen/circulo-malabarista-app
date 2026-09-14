require("dotenv").config();

const mongoose = require("mongoose");

const conectarBaseDatos = require("../src/config/database");
const Numero = require("../src/models/Numero");
const Artista = require("../src/models/Artista");

const numerosAdicionales = [
    {
        nombre: "Cuerda floja",
        categoria: "Equilibrismo",
        descripcion:
            "Número de equilibrio y desplazamiento sobre cuerda floja.",
        precioBase: 30000,
        recursoUnico: true,
        activo: true
    },
    {
        nombre: "Pelotas de rebote",
        categoria: "Malabarismo",
        descripcion:
            "Número de malabarismo utilizando rebotes controlados.",
        precioBase: 20000,
        recursoUnico: true,
        activo: true
    }
];

const configuracionArtistas = [
    {
        nombre: "Carlos",
        tecnicas: [
            "Pelotas",
            "Clavas",
            "Rola bola",
            "Cuerda floja",
            "Pelotas de rebote",
            "Antorchas"
        ]
    },
    {
        nombre: "Aaron",
        tecnicas: [
            "Trompo",
            "Diábolo",
            "Pelotas",
            "Clavas"
        ]
    },
    {
        nombre: "Gelarie",
        tecnicas: [
            "Hula hula",
            "Clavas",
            "Payaso"
        ]
    },
    {
        nombre: "Gerald",
        tecnicas: [
            "Pelotas",
            "Clavas",
            "Payaso",
            "Antorchas",
            "Rola bola"
        ]
    }
];

async function crearArtistas() {
    try {
        await conectarBaseDatos();

        for (const numero of numerosAdicionales) {
            await Numero.findOneAndUpdate(
                { nombre: numero.nombre },
                { $set: numero },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

            console.log(`Número disponible: ${numero.nombre}`);
        }

        for (const configuracion of configuracionArtistas) {
            const numeros = await Numero.find({
                nombre: {
                    $in: configuracion.tecnicas
                }
            });

            if (
                numeros.length !== configuracion.tecnicas.length
            ) {
                const encontrados = numeros.map(
                    (numero) => numero.nombre
                );

                const faltantes = configuracion.tecnicas.filter(
                    (nombre) => !encontrados.includes(nombre)
                );

                throw new Error(
                    `Faltan números para ${configuracion.nombre}: ${faltantes.join(", ")}`
                );
            }

            await Artista.findOneAndUpdate(
                {
                    nombre: configuracion.nombre
                },
                {
                    $set: {
                        tecnicas: numeros.map(
                            (numero) => numero._id
                        ),
                        activo: true
                    }
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

            console.log(
                `Artista configurado: ${configuracion.nombre}`
            );
        }

        console.log(
            "Artistas y técnicas configurados correctamente"
        );

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(
            "No fue posible configurar los artistas:"
        );

        console.error(error.message);

        await mongoose.disconnect();
        process.exit(1);
    }
}

crearArtistas();