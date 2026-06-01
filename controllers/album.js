// accion de prueba
const Album = require("../models/album");
const Song = require("../models/song");
const fs = require("fs");
const path = require("path");

const prueba = (req, res) => {
  return res.status(200).json({
    status: "success",
    message:
      "Accion de prueba en controllers/album.js funcionando correctamente",
  });
};

// Guardar album

const saveAlbum = (req, res) => {
  // recoger parametros por post
  const params = req.body;

  // crear objeto a guardar
  const album = new Album(params);

  // Guardar el album
  album.save((err, albumStored) => {
    if (err || !albumStored) {
      return res.status(400).json({
        status: "error",
        message: "El album no se ha guardado",
      });
    }

    // Guardar el album

    return res.status(200).json({
      status: "success",
      message: "Album guardado",
      album,
    });
  });
};

const one = (req, res) => {
  // Sacar id de la url
  const albumId = req.params.id;

  // Find

  Album.findById(albumId)
    .populate("artist")
    .exec((err, album) => {
      if (err || !album) {
        return res.status(404).json({
          status: "error",
          message: "El album no existe",
        });
      }

      return res.status(200).json({
        status: "success",
        album,
      });
    });
};

const list = (req, res) => {
  // sacar id del artista de url
  const artistId = req.params.id;

  if (!artistId) {
    return res.status(400).json({
      status: "error",
      message: "El id del artista es obligatorio",
    });
  }

  // sacar todos los albums de un artista concreto

  Album.find({ artist: artistId })
    .populate("artist")
    .exec((err, albums) => {
      if (err || !albums) {
        return res.status(404).json({
          status: "error",
          message: "No hay albums para mostrar",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Listado de albums por artista",
        albums,
      });
    });
};

const update = (req, res) => {
  // recoger para url
  const albumId = req.params.id;

  // recoger body
  const update = req.body;

  // find and update

  Album.findByIdAndUpdate(
    albumId,
    update,
    { new: true },
    (err, albumUpdated) => {
      if (err || !albumUpdated) {
        return res.status(400).json({
          status: "error",
          message: "No se ha podido actualizar el album",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Album actualizado",
        album: albumUpdated,
      });
    },
  );
};

const upload = async (req, res) => {
  // Recoger fichero de imagen y comprobar si se ha subido

  let albumId = req.params.id;

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

  Album.findByIdAndUpdate(
    { _id: albumId },
    { image: req.file.filename },
    { new: true },
    (err, albumUpdated) => {
      if (err || !albumUpdated) {
        return res.status(500).json({
          status: "error",
          message: "Error al guardar la imagen del álbum",
        });
      }

      return res.status(200).json({
        status: "success",
        album: albumUpdated,
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
  const filePath = "./uploads/albums/" + fileName;

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

const remove = async (req, res) => {
  // recoger id del album por la url
  const albumId = req.params.id;

  // consultar buscar y eliminar el album
  try {

    const albumRemoved = await Album.find({ _id: albumId });

    albumRemoved.forEach(async (album) => {
      await Song.find({ album: album._id }).remove();
      album.remove();
    });

    // remove de songs
    //const songRemoved = await Song.find({ album: albumRemoved._id }).remove();
    if (!albumRemoved) {
      return res.status(404).json({
        status: "error",
        message: "El álbum no existe",
      });
    }

    // devolver resultado
    return res.status(200).json({
      status: "success",
      message: "Álbum eliminado",
      album: albumRemoved,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "No se ha podido eliminar el álbum",
      error: err.message,
    });
  }
};

// exportar acciones
module.exports = {
  prueba,
  saveAlbum,
  one,
  list,
  update,
  upload,
  avatar,
  remove,
};
