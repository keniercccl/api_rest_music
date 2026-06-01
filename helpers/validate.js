const validator = require("validator");

const validate = (data) => {
  let resultado = false;

  let name =
    !validator.isEmpty(data.name) &&
    validator.isLength(data.name, { min: 2, max: 100 }) &&
    validator.isAlpha(data.name, "es-ES");

  let nick =
    !validator.isEmpty(data.nick) &&
    validator.isLength(data.nick, { min: 2, max: 100 });

  let email = !validator.isEmpty(data.email) && validator.isEmail(data.email);

  let password =
    !validator.isEmpty(data.password) &&
    validator.isLength(data.password, { min: 6, max: 100 });

  if (data.surname) {
    let surname =
      validator.isLength(data.surname, { min: 2, max: 100 }) &&
      validator.isAlpha(data.surname, "es-ES");

    if (!surname) {
      throw new Error("No se ha superado la validación de apellido");
    } else {
      console.log("Validación superada en el apellido");
    }
  }

  if (!name || !nick || !email || !password) {
    throw new Error("No se ha superado la validación de los datos");
  } else {
    console.log("Validación superada en los datos");
    resultado = true;
  }

  return resultado;
};

module.exports = validate;
