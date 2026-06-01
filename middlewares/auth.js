// importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// mportar clave secreta

//const { secret } = require("../helpers/jwt");

// crear middleware de autenticacion

const auth = (req, res, next) => {
  // comprobar header de autenticacion
  if (!req.headers.authorization) {
    return res.status(401).json({
      status: "error",
      message: "La petición no tiene la cabecera de autenticación",
    });
  }

  // limpiar token y comprobar si es correcto

  let token = req.headers.authorization.replace(/['"]+/g, "");

  // decodificar token

try {
  const payload = jwt.decode(
    token,
    process.env.JWT_SECRET
  );

  if (payload.exp <= moment().unix()) {
    return res.status(401).json({
      status: "error",
      message: "Token expirado"
    });
  }

  req.user = payload;
  next();

} catch (error) {
  return res.status(401).json({
    status: "error",
    message: "Token inválido"
  });
}

  // agregar datos del usuario a la request

  // ejecutar
  // next();
};

// exportar middleware

module.exports = {
  auth,
};
