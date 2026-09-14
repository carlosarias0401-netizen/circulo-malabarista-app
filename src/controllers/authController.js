const Usuario = require("../models/Usuario");

function mostrarLogin(req, res) {
    if (req.session.usuario) {
        return res.redirect("/panel");
    }

    res.render("login", {
        titulo: "Acceso interno",
        error: null
    });
}

async function iniciarSesion(req, res) {
    try {
        const correo = req.body.correo?.trim().toLowerCase();
        const contrasena = req.body.contrasena;

        if (!correo || !contrasena) {
            return res.status(400).render("login", {
                titulo: "Acceso interno",
                error: "Debes ingresar el correo y la contraseña."
            });
        }

        const usuario = await Usuario.findOne({ correo });

        if (!usuario || !usuario.estado) {
            return res.status(401).render("login", {
                titulo: "Acceso interno",
                error: "Las credenciales ingresadas no son válidas."
            });
        }

        const contrasenaValida =
            await usuario.comprobarContrasena(contrasena);

        if (!contrasenaValida) {
            return res.status(401).render("login", {
                titulo: "Acceso interno",
                error: "Las credenciales ingresadas no son válidas."
            });
        }

        req.session.usuario = {
            id: usuario._id.toString(),
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        };

        req.session.save(() => {
            res.redirect("/panel");
        });
    } catch (error) {
        console.error(error);

        res.status(500).render("login", {
            titulo: "Acceso interno",
            error: "No fue posible iniciar sesión."
        });
    }
}

function cerrarSesion(req, res) {
    req.session.destroy(() => {
        res.clearCookie("circulo.sid");
        res.redirect("/login");
    });
}

module.exports = {
    mostrarLogin,
    iniciarSesion,
    cerrarSesion
};