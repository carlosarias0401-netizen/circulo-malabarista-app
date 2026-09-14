function exponerUsuario(req, res, next) {
    res.locals.usuarioActual = req.session.usuario || null;
    next();
}

function requerirAutenticacion(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect("/login");
    }

    next();
}

function requerirRol(...rolesPermitidos) {
    return function (req, res, next) {
        if (
            !req.session.usuario ||
            !rolesPermitidos.includes(req.session.usuario.rol)
        ) {
            return res.status(403).render("403", {
                titulo: "Acceso denegado"
            });
        }

        next();
    };
}

module.exports = {
    exponerUsuario,
    requerirAutenticacion,
    requerirRol
};