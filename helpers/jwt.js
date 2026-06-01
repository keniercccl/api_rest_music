// importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta para generar el token
// const secret = process.env.JWT_SECRET || "clave_secreta_para_generar_token";

// Crear funcion para generar token

const createToken = (user) => {
  // crear objeto con la información del usuario
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "minutes").unix(),
  };

  // generar token
  return jwt.encode(payload, process.env.JWT_SECRET);
};

// exportar modulo
module.exports = {
  createToken,
};
