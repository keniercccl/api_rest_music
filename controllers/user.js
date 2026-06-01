const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const User = require("../models/user");
const jwt = require("../helpers/jwt");
const fs = require("fs");
const path = require("path");

// accion de prueba

const prueba = (req, res) => {
  return res.status(200).json({
    status: "success",
    message:
      "Accion de prueba en controllers/user.js funcionando correctamente",
  });
};

// Registro
const register = (req, res) => {
  // recoger datos de usuario
  const params = req.body;

  // comprobar si el usuario existe
  if (!params.name || !params.nick || !params.email || !params.password) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  // validar datos
  try {
    validate(params);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Error en la validación de los datos",
      detail: error.message,
    });
  }

  // control de usuarios duplicados

  User.find({ $or: [{ email: params.email }, { nick: params.nick }] }).exec(
    async (err, users) => {
      console.log(users);

      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error en la consulta de usuarios duplicados",
        });
      }

      if (users.length > 0) {
        console.log("Aqui esta el error");
        return res.status(400).json({
          status: "error",
          message: "El usuario ya existe",
        });
      }

      // cifrar contraseña
      let pwd = await bcrypt.hash(params.password, 10);
      params.password = pwd;

      // crear objeto de usuario
      const userToSave = new User(params);

      // guardar usuario en la base de datos
      userToSave.save((err, userStored) => {
        if (err || !userStored) {
          return res.status(500).json({
            status: "error",
            message: "Error al guardar el usuario",
          });
        }

        // limpiar respuesta
        let userCreated = userToSave.toObject();
        userCreated.password = undefined;
        userCreated.role = undefined;

        // devolver respuesta

        res.status(200).json({
          status: "success",
          message: "Registro de usuario",
          user: userCreated,
        });
      });
    },
  );
};

// Login
const login = (req, res) => {
  // recoger datos de usuario

  let params = req.body;

  // comprobar los datos
  if (!params.email || !params.password) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  // buscar usuario que coincida con el email
  User.findOne({ email: params.email })
    .select("+password +role")
    .exec(async (err, user) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error en la consulta de usuarios",
        });
      }

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "El usuario no existe",
        });
      }

      // comprobar contraseña
      const pwd = await bcrypt.compare(params.password, user.password);

      if (!pwd) {
        return res.status(400).json({
          status: "error",
          message: "Contraseña incorrecta",
        });
      }

      // buscar en bd si existe el usuario

      // Conseguir token (crear token jwt)
      const token = jwt.createToken(user);
      // limpiar respuesta para no mostrar datos sensibles
      user.toObject();
      user.password = undefined;
      user.role = undefined;

      // Devolver respuesta con el token

      return res.status(200).json({
        status: "success",
        message: "Login de usuario",
        user: user,
        access_token: token,
      });
    });
};

// importar usuario

const profile = (req, res) => {
  // recoger id de usuario
  const userId = req.params.id;

  // Consulta para sacar los datos de perfil

  User.findById(userId).exec((err, user) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error en la consulta de usuario",
      });
    }

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "El usuario no existe",
      });
    }

    // devolver resultado

    return res.status(200).json({
      status: "success",
      message: "Accion de prueba en profilee",
      user: user,
    });
  });
};

const update = (req, res) => {
  // recoger id de usuario
  const userIdentity = req.user;

  // recoger datos de usuario
  const params = req.body;

  // validar datos
  try {
    validate(params);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Error en la validación de los datos",
      detail: error.message,
    });
  }

  User.find({ $or: [{ email: params.email }, { nick: params.nick }] }).exec(
    async (err, users) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error en la consulta de usuarios",
        });
      }

      // comprobar si el email o el nick ya existen en otros usuarios
      let user_isset = false;
      users.forEach((user) => {
        if (user && user._id.toString() !== userIdentity.id) {
          user_isset = true;
        }
      });

      // si el email o el nick ya existen en otros usuarios no permitir la actualización
      if (user_isset) {
        return res.status(400).json({
          status: "error",
          message: "El email o el nick ya existen en otros usuarios",
        });
      }

      // cifrar contraseña
      if (params.password) {
        let pwd = await bcrypt.hashSync(params.password, 10);
        params.password = pwd;
      } else {
        delete params.password;
      }

      try {
        // buscar usuario en bd y actualizarlo
        let userToUpdate = await User.findByIdAndUpdate(
          { _id: userIdentity },
          params,
          { new: true },
        );

        if (!userToUpdate) {
          return res.status(404).json({
            status: "error",
            message: "No se ha encontrado el usuario para actualizar",
          });
        }

        return res.status(200).json({
          status: "success",
          message: "Usuario actualizado correctamente",
          user: userToUpdate,
        });
      } catch (error) {
        return res.status(500).json({
          status: "error",
          message: "Error al actualizar el usuario",
        });
      }
    },
  );
};

const upload = (req, res) => {
  // Configuracion de subida co multer

  // Recoger fichero de imagen y comprobar si se ha subido

  if (!req.file) {
    return res.status(404).json({
      status: "error",
      message: "No se ha subido ninguna imagen",
    });
  }

  // Conseguir el nombre del archivo
  let image = req.file.originalname;

  // Sacar la extension del archivo
  const file_ext = image.split(".").pop().toLowerCase();

  // Comprobar extension, solo imagenes, si no es valida borrar fichero subido
  if (
    file_ext != "png" &&
    file_ext != "jpg" &&
    file_ext != "jpeg" &&
    file_ext != "gif"
  ) {
    // borrar el archivo subido
    const file_path = req.file.path;
    const file_deleted = fs.unlinkSync(file_path);

    // Devolver respuesta de error
    return res.status(400).json({
      status: "error",
      message: "La extension del archivo no es valida",
    });
  }

  // Si todo es valido, guardar imagen en base de datos (carpeta uploads) y en el campo del usuario
  User.findByIdAndUpdate(
    { _id: req.user.id },
    { image: req.file.filename },
    { new: true },
    (err, userUpdated) => {
      if (err || !userUpdated) {
        return res.status(500).json({
          status: "error",
          message: "Error al guardar la imagen de usuario",
        });
      }

      return res.status(200).json({
        status: "success",
        user: userUpdated,
        message: "Accion de prueba en upload",
        file: req.file,
      });
    },
  );
};

const avatar = (req, res) => {
  // Sacar el parametro de la url}
  const fileName = req.params.filename;

  // Montar el path real de la imagen
  const filePath = "./uploads/avatars/" + fileName;

  // Comprobar si el fichero existe
  fs.stat(filePath, (err, exists) => {
    if (err || !exists) {
      return res.status(404).json({
        status: "error",
        message: "La imagen no existe",
      });
    }

    return res.sendFile(path.resolve(filePath));
  });

  // Devolver la imagen
};

// exportar acciones
module.exports = {
  prueba,
  register,
  login,
  profile,
  update,
  upload,
  avatar,
};
