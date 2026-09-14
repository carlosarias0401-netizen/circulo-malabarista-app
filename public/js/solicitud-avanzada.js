const botonesAgregar = document.querySelectorAll(
    ".boton-agregar"
);

const parrillaSeleccionada = document.getElementById(
    "parrillaSeleccionada"
);

const parrillaVacia = document.getElementById(
    "parrillaVacia"
);

const camposOcultos = document.getElementById(
    "camposOcultos"
);

const cantidadArtistas = document.getElementById(
    "cantidadArtistas"
);

const cantidadArtistasTexto = document.getElementById(
    "cantidadArtistasTexto"
);

const nombresArtistas = document.getElementById(
    "nombresArtistas"
);  

const duracionMinutos = document.getElementById(
    "duracionMinutos"
);

const cantidadAsistentes = document.getElementById(
    "cantidadAsistentes"
);

const fechaEvento = document.getElementById("fechaEvento");

const formulario = document.getElementById(
    "formularioAvanzado"
);

const valorCotizacion = document.getElementById(
    "valorCotizacion"
);

const seleccionados = [];

const VALOR_MINIMO_ARTISTA = 35000;
const VALOR_SONIDISTA = 30000;
const RECARGO_CADA_30_MINUTOS = 10000;
const RECARGO_EVENTO_MASIVO = 15000;

function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(valor);
}

async function actualizarAsignacionArtistas() {
    if (seleccionados.length === 0) {
        cantidadArtistas.value = "1";

        cantidadArtistasTexto.textContent =
            "Selecciona números para calcularlo";

        nombresArtistas.textContent =
            "El sistema buscará automáticamente la combinación mínima de artistas.";

        calcularCotizacion();
        return;
    }

    cantidadArtistasTexto.textContent =
        "Calculando artistas...";

    nombresArtistas.textContent =
        "Estamos revisando las técnicas disponibles.";

    try {
        const respuesta = await fetch(
            "/api/asignacion-artistas",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    numeros: seleccionados.map(
                        (numero) => numero.id
                    )
                })
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.disponible) {
            cantidadArtistasTexto.textContent =
                "Combinación no disponible";

            nombresArtistas.textContent =
                resultado.mensaje ||
                "No existen artistas suficientes.";

            cantidadArtistas.value = "0";
            calcularCotizacion();
            return;
        }

        cantidadArtistas.value =
            resultado.cantidad.toString();

        cantidadArtistasTexto.textContent =
            resultado.cantidad === 1
                ? "1 artista"
                : `${resultado.cantidad} artistas`;

        nombresArtistas.textContent =
            `Equipo sugerido: ${resultado.artistas.join(", ")}`;

        calcularCotizacion();
    } catch (error) {
        cantidadArtistasTexto.textContent =
            "No fue posible calcular el equipo";

        nombresArtistas.textContent =
            "Revisa la conexión e intenta nuevamente.";

        cantidadArtistas.value = "0";
        calcularCotizacion();
    }
}

function calcularCotizacion() {
    const valorNumeros = seleccionados.reduce(
        (total, numero) => total + numero.precio,
        0
    );

    const artistas =
        Number(cantidadArtistas.value) || 0;

    const duracion =
        Number(duracionMinutos.value) || 0;

    const asistentes =
        Number(cantidadAsistentes.value) || 0;

    const minimoArtistas =
        artistas * VALOR_MINIMO_ARTISTA;

    const valorArtistico = Math.max(
        valorNumeros,
        minimoArtistas
    );

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
        valorArtistico +
        VALOR_SONIDISTA +
        recargoDuracion +
        recargoAsistentes;

    valorCotizacion.textContent = formatearPrecio(total);
}

function actualizarBotonesAgregar() {
    botonesAgregar.forEach((boton) => {
        const agregado = seleccionados.some(
            (numero) => numero.id === boton.dataset.id
        );

        boton.disabled = agregado;
        boton.textContent = agregado
            ? "Agregado"
            : "Agregar a mi espectáculo";
    });
}

function renderizarParrilla() {
    parrillaSeleccionada.innerHTML = "";
    camposOcultos.innerHTML = "";

    parrillaVacia.classList.toggle(
        "oculto",
        seleccionados.length > 0
    );

    seleccionados.forEach((numero, indice) => {
        const elemento = document.createElement("li");

        elemento.className = "elemento-parrilla";

        elemento.innerHTML = `
            <div>
                <span class="posicion-parrilla">
                    Presentación ${indice + 1}
                </span>

                <strong>${numero.nombre}</strong>

                <small>${formatearPrecio(numero.precio)}</small>
            </div>

            <div class="acciones-parrilla">
                <button
                    type="button"
                    data-accion="subir"
                    data-indice="${indice}"
                    ${indice === 0 ? "disabled" : ""}
                >
                    Subir
                </button>

                <button
                    type="button"
                    data-accion="bajar"
                    data-indice="${indice}"
                    ${
                        indice === seleccionados.length - 1
                            ? "disabled"
                            : ""
                    }
                >
                    Bajar
                </button>

                <button
                    type="button"
                    data-accion="quitar"
                    data-indice="${indice}"
                    class="boton-quitar"
                >
                    Quitar
                </button>
            </div>
        `;

        parrillaSeleccionada.appendChild(elemento);

        const campoNumero = document.createElement("input");
        campoNumero.type = "hidden";
        campoNumero.name = "numeros";
        campoNumero.value = numero.id;

        const campoOrden = document.createElement("input");
        campoOrden.type = "hidden";
        campoOrden.name = `ordenes[${numero.id}]`;
        campoOrden.value = indice + 1;

        camposOcultos.appendChild(campoNumero);
        camposOcultos.appendChild(campoOrden);
    });

    actualizarBotonesAgregar();
    actualizarAsignacionArtistas();
}

botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", () => {
        seleccionados.push({
            id: boton.dataset.id,
            nombre: boton.dataset.nombre,
            precio: Number(boton.dataset.precio)
        });

        renderizarParrilla();
    });
});

parrillaSeleccionada.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");

    if (!boton) {
        return;
    }

    const indice = Number(boton.dataset.indice);
    const accion = boton.dataset.accion;

    if (accion === "subir" && indice > 0) {
        [
            seleccionados[indice - 1],
            seleccionados[indice]
        ] = [
            seleccionados[indice],
            seleccionados[indice - 1]
        ];
    }

    if (
        accion === "bajar" &&
        indice < seleccionados.length - 1
    ) {
        [
            seleccionados[indice],
            seleccionados[indice + 1]
        ] = [
            seleccionados[indice + 1],
            seleccionados[indice]
        ];
    }

    if (accion === "quitar") {
        seleccionados.splice(indice, 1);
    }

    renderizarParrilla();
});

[   
    duracionMinutos,
    cantidadAsistentes
].forEach((campo) => {
    campo.addEventListener("input", calcularCotizacion);
    campo.addEventListener("change", calcularCotizacion);
});

formulario.addEventListener("submit", (evento) => {
    if (seleccionados.length === 0) {
        evento.preventDefault();

        alert(
            "Agrega al menos un número artístico a tu espectáculo."
        );
    }
});

const hoy = new Date();
const diferenciaZona = hoy.getTimezoneOffset() * 60000;

fechaEvento.min = new Date(hoy - diferenciaZona)
    .toISOString()
    .slice(0, 10);

renderizarParrilla();