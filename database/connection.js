// Importar modulos necesarios
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

// Configurar conexion a base de datos
const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("URI definida:", !!process.env.MONGO_URI);
    console.log("URI empieza por:", process.env.MONGO_URI?.substring(0, 25));

    console.log("MongoDB conectado correctament");
  } catch (error) {
    console.error("ERROR MONGODB");
    console.error(error.message);
    console.error(error);

    throw error;
  }
};

// Exportar conexion a base de datos
module.exports = connection;
