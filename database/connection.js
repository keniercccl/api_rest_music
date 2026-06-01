// Importar modulos necesarios
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

// Configurar conexion a base de datos
const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado correctament");
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo conectar a la base de datos");
  }
};

// Exportar conexion a base de datos
module.exports = connection;
