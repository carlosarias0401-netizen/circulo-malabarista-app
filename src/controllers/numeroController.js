const Numero = require("../models/Numero");

async function listarNumerosPublicos(req, res) {
    try {
        const numeros = await Numero.find({ activo: true })
            .sort({ categoria: 1, nombre: 1 });

        res.render("numeros", {
            titulo: "Números artísticos",
            numeros
        });
    } catch (error) {
        console.error(error);

        res.status(500).send(
            "No fue posible cargar los números artísticos."
        );
    }
}

module.exports = {
    listarNumerosPublicos
};