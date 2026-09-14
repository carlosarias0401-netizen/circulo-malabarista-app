const cantidadArtistas = document.getElementById(
    "cantidadArtistas"
);

const duracionMinutos = document.getElementById(
    "duracionMinutos"
);

const cantidadAsistentes = document.getElementById(
    "cantidadAsistentes"
);

const fechaEvento = document.getElementById("fechaEvento");

const valorCotizacion = document.getElementById(
    "valorCotizacion"
);

const VALOR_ARTISTA = 35000;
const VALOR_SONIDISTA = 30000;
const RECARGO_CADA_30_MINUTOS = 10000;
const RECARGO_EVENTO_MASIVO = 15000;

function calcularCotizacion() {
    const artistas =
        Number(cantidadArtistas.value) || 0;

    const duracion =
        Number(duracionMinutos.value) || 0;

    const asistentes =
        Number(cantidadAsistentes.value) || 0;

    const valorArtistas = artistas * VALOR_ARTISTA;

    const bloquesAdicionales = Math.max(
        0,
        Math.ceil((duracion - 60) / 30)
    );

    const recargoDuracion =
        bloquesAdicionales * RECARGO_CADA_30_MINUTOS;

    const recargoAsistentes =
        asistentes > 200
            ? RECARGO_EVENTO_MASIVO
            : 0;

    const total =
        valorArtistas +
        VALOR_SONIDISTA +
        recargoDuracion +
        recargoAsistentes;

    valorCotizacion.textContent =
        new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }).format(total);
}

const hoy = new Date();
const diferenciaZona = hoy.getTimezoneOffset() * 60000;

fechaEvento.min = new Date(hoy - diferenciaZona)
    .toISOString()
    .slice(0, 10);

cantidadArtistas.addEventListener(
    "change",
    calcularCotizacion
);

duracionMinutos.addEventListener(
    "change",
    calcularCotizacion
);

cantidadAsistentes.addEventListener(
    "input",
    calcularCotizacion
);

calcularCotizacion();