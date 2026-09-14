require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const conectarBaseDatos = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const panelRoutes = require("./src/routes/panelRoutes");

const publicRoutes = require("./src/routes/publicRoutes");

const {
    exponerUsuario
} = require("./src/middleware/autenticacion");

const app = express();
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// Archivos públicos
app.use(express.static(path.join(__dirname, "public")));

// Lectura de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(
    session({
        name: "circulo.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: "sesiones"
        }),

        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 4
        }
    })
);

// Permite utilizar usuarioActual en las vistas
app.use(exponerUsuario);

// Página principal
app.get("/", (req, res) => {
    res.render("inicio", {
        titulo: "Círculo Malabarista"
    });
});

// Rutas de autenticación y panel
app.use(publicRoutes);
app.use(authRoutes);
app.use(panelRoutes);

// Inicio de la aplicación
async function iniciarServidor() {
    await conectarBaseDatos();

    app.listen(PORT, () => {
        console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });
}

iniciarServidor();