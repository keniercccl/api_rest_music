// accion de prueba
const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

const prueba = (req, res) => {
  return res.status(200).json({
    status: "success",
    message:
      "Accion de prueba en controllers/song.js funcionando correctamente",
  });
};

const saveSong = (req, res) => {

  let params = req.body;

  let song = new Song(params);

  song.save((err, songStored) => {
    if (err || !songStored) {
      return res.status(400).json({
        status: "error",
        message: "La canción no se ha guardado", 
        error: err,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Canción guardada",
      songs: songStored,
    });
  });

};

const one = (req, res) => {
  // recoger id de la url
  const songId = req.params.id;

  // buscar la canción

  Song.findById(songId, (err, song) => {
    if (err || !song) {
      return res.status(404).json({
        status: "error",
        message: "La canción no existe",
      });
    }

    return res.status(200).json({
      status: "success",
      song,
    });
  });
};

const list = (req, res) => {
  // sacar todas las canciones de un album concreto

  const albumId = req.params.album;

  Song.find({ album: albumId })
    .populate("album")
    .sort("track")
    .exec((err, songs) => {
      if (err || !songs) {
        return res.status(404).json({
          status: "error",
          message: "No hay canciones",
        });
      }

      return res.status(200).json({
        status: "success",
        songs,
      });
    });
};

const update = function (req, res) {
  // parametro url id de canción
  const songId = req.params.id;

  // recoger datos de body
  const update = req.body;

  // datos para guardar
  Song.findByIdAndUpdate(songId, update, { new: true }, (err, songUpdated) => {
    if (err || !songUpdated) {
      return res.status(400).json({
        status: "error",
        message: "No se ha podido actualizar la canción",
      });
    }

    return res.status(200).json({
      status: "success",
      song: songUpdated,
    });
  });

  // buqueda y actualización de documento
};

const remove = (req, res) => {
  // recoger id de la url
  const songId = req.params.id;

  if (!songId) {
    return res.status(400).json({
      status: "error",
      message: "El id de la canción es obligatorio",
    });
  }

  // buscar la canción y eliminarla
  Song.findByIdAndRemove(songId, (err, songRemoved) => {
    if (err || !songRemoved) {
      return res.status(404).json({
        status: "error",
        message: "La canción no se ha eliminado",
      });
    }

    return res.status(200).json({
      status: "success",
      song: songRemoved,
    });
  });
};

const file = async (req, res) => {
  // Recoger fichero de imagen y comprobar si se ha subido

  let songId = req.params.id;

  if (!req.file) {
    return res.status(404).json({
      status: "error",
      message: "No se ha subido ninguna imagen",
    });
  }

  // Conseguir el nombre del archivo

  let image = req.file.originalname;

  // Sacar la extension del archivo
  const image_split = image.split(".");
  const file_ext = image.split(".").pop().toLowerCase();

  // Comprobar extension, solo imagenes, si no es valida borrar fichero subido
  if (file_ext != "mp3" && file_ext != "ogg") {
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

  // try {
  //   const artistUpdated = await Artist.findByIdAndUpdate(
  //     { _id: artistId },
  //     { image: req.file.filename },
  //     { new: true },
  //   ).exec();

  //   if (!artistUpdated) {
  //     return res.status(404).json({
  //       status: "error",
  //       message: "El artista no existe",
  //     });
  //   }

  //   return res.status(200).json({
  //     status: "success",
  //     artist: artistUpdated,
  //     message: "Accion de prueba en upload",
  //     file: req.file,
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Error al guardar la imagen de artist",
  //   });
  // }

  Song.findByIdAndUpdate(
    { _id: songId },
    { image: req.file.filename },
    { new: true },
    (err, songUpdated) => {
      if (err || !songUpdated) {
        return res.status(500).json({
          status: "error",
          message: "Error al guardar la imagen de la canción",
        });
      }

      return res.status(200).json({
        status: "success",
        song: songUpdated,
        message: "Accion de prueba en upload",
        file: req.file,
      });
    },
  );
};

const audio = (req, res) => {
  // Sacar el parametro de la url}
  const fileName = req.params.filename;

  // Montar el path real de la imagen
  const filePath = "./uploads/songs/" + fileName;

  // Comprobar si el fichero existe
  fs.stat(filePath, (err, exists) => {
    if (err || !exists) {
      console.log("***********************************************");
      console.log("******************AQUI************************");
      console.log(err);
      console.log("***********************************************");
      return res.status(404).json({
        status: "error",
        message: "La imagen no existe",
      });
    }

    // Devolver la imagen
    return res.sendFile(path.resolve(filePath));
  });
};

// exportar acciones
module.exports = {
  prueba,
  saveSong,
  one,
  list,
  update,
  remove,
  file,
  audio,
};
