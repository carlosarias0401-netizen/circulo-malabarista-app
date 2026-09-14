const Artista = require("../models/Artista");

function generarCombinaciones(elementos, cantidad) {
    const resultado = [];

    function combinar(inicio, seleccionados) {
        if (seleccionados.length === cantidad) {
            resultado.push([...seleccionados]);
            return;
        }

        for (
            let indice = inicio;
            indice < elementos.length;
            indice++
        ) {
            seleccionados.push(elementos[indice]);
            combinar(indice + 1, seleccionados);
            seleccionados.pop();
        }
    }

    combinar(0, []);

    return resultado;
}

function combinacionCubreNumeros(
    combinacion,
    numerosSolicitados
) {
    const tecnicasDisponibles = new Set();

    combinacion.forEach((artista) => {
        artista.tecnicas.forEach((tecnica) => {
            tecnicasDisponibles.add(tecnica.toString());
        });
    });

    return numerosSolicitados.every((numeroId) =>
        tecnicasDisponibles.has(numeroId.toString())
    );
}

async function obtenerAsignacionMinima(numeroIds) {
    const idsSolicitados = numeroIds.map((id) =>
        id.toString()
    );

    const artistas = await Artista.find({
        activo: true,
        tecnicas: {
            $in: idsSolicitados
        }
    }).sort({ nombre: 1 });

    for (
        let cantidad = 1;
        cantidad <= artistas.length;
        cantidad++
    ) {
        const combinaciones = generarCombinaciones(
            artistas,
            cantidad
        );

        const asignacion = combinaciones.find(
            (combinacion) =>
                combinacionCubreNumeros(
                    combinacion,
                    idsSolicitados
                )
        );

        if (asignacion) {
            return asignacion;
        }
    }

    return null;
}

module.exports = {
    obtenerAsignacionMinima
};