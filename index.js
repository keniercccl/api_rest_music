// ===============================
// Cargar variables de entorno
// ===============================
require("dotenv").config();

// ===============================
// Importar conexion a base de datos
// ===============================
const connection = require("./database/connection");

// ===============================
// Importar dependencias
// ===============================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// ===============================
// Mensaje de bienvenida
// ===============================
console.log("Bienvenido a la APP_MUSICA");

// ===============================
// Validar variables de entorno
// ===============================
console.log("MONGO_URI existe:", !!process.env.MONGO_URI);
console.log("JWT_SECRET existe:", !!process.env.JWT_SECRET);
console.log("PORT:", process.env.PORT);

if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI no definida");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET no definida");
  process.exit(1);
}

// ===============================
// Crear servidor Express
// ===============================
const app = express();

// ===============================
// Configurar seguridad
// ===============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones por IP
});

app.use(cors());
app.use(helmet());
app.use(limiter);

// ===============================
// Configurar Body Parser
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Importar rutas
// ===============================
const userRoutes = require("./routes/user");
const albumRoutes = require("./routes/album");
const songRoutes = require("./routes/song");
const artistRoutes = require("./routes/artist");

// ===============================
// Registrar rutas
// ===============================
app.use("/api/user", userRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/song", songRoutes);
app.use("/api/artist", artistRoutes);

// ===============================
// Ruta de prueba
// ===============================
app.get("/ruta-probando", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Ruta de prueba funcionando correctamente",
  });
});

// ===============================
// Health Check para Render
// ===============================
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "success",
    service: "api-rest-musica",
    uptime: process.uptime(),
  });
});

// ===============================
// Iniciar aplicación
// ===============================
const startServer = async () => {
  try {
    // Conectar MongoDB
    await connection();

    console.log("Base de datos conectada correctamente");

    // Levantar servidor
    app.listen(process.env.PORT, () => {
      console.log(
        `Servidor escuchando en el puerto ${process.env.PORT}`
      );
    });

  } catch (error) {

    console.error(
      "Error al iniciar la aplicación:"
    );

    console.error(error);

    process.exit(1);
  }
};

// Ejecutar aplicación
startServer();
// finaliza