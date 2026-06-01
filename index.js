// Importart conexion a base de datos 
const connection = require("./database/connection");
require("dotenv").config();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Importar dependencias
const express = require("express");
const cors = require("cors");

// Mensaje de bienvenida
console.log("Bienvenido a la APPP_ MUSICA");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Ejecutar conexion a base de datos
(async () => {
  await connection();
})();
// connection();

// Crear Servidor de node

const app = express();


// Configurar cors
app.use(cors());
app.use(helmet());
app.use(limiter);

// Configurar datos de body a json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rutas
const userRoutes = require("./routes/user");
const albumRoutes = require("./routes/album");
const songRoutes = require("./routes/song");
const artistRoutes = require("./routes/artist");

app.use("/api/user", userRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/song", songRoutes);
app.use("/api/artist", artistRoutes);


// Ruta de prueba

app.get("/ruta-probando", (req, res) => {
  return res.status(200).json(
    {
      message: "Ruta de prueba funcionando correctamente",
    }
  );
});

// Poner a escuchar el servidor en un puerto
app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
