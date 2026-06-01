// importar modelos
const Artist = require("../models/artist");
const Album = require("../models/album");
const Song = require("../models/song");
const mongoosePaginate = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

// accion de prueba

const prueba = (req, res) => {
  return res.status(200).json({
    status: "success",
    message:
      "Accion de prueba en controllers/artists.js funcionando correctamente",
  });
};

const saveArtist = (req, res) => {
  // recoger parametros por post
  const params = req.body;

  // crear objeto a guardar
  const artist = new Artist(params);

  // Guardar el artista
  artist.save((err, artistStored) => {
    if (err || !artistStored) {
      return res.status(400).json({
        status: "error",
        message: "El artista no se ha guardado",
      });
    }

    // Guardar el artista

    return res.status(200).json({
      status: "success",
      message: "Artista guardado",
      artist,
    });
  });
};

const one = (req, res) => {
  // recoger id de la url
  const artistId = req.params.id;

  // buscar el artista

  Artist.findById(artistId, (err, artist) => {
    if (err || !artist) {
      return res.status(404).json({
        status: "error",
        message: "El artista no existe",
      });
    }

    return res.status(200).json({
      status: "success",
      artist,
    });
  });
};

const list = (req, res) => {
  // recoger pagina actual
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }

  // definir numero de elementos por pagina
  let itemsPerPage = 5;

  // listar artistas paginados

  Artist.find()
    .sort("name")
    .paginate(page, itemsPerPage, (error, artists, total) => {
      if (error || !artists) {
        return res.status(404).json({
          status: "error",
          message: "No hay artistas para mostrar",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Listado de artistas",
        page: page,
        items_per_page: itemsPerPage,
        total: Math.ceil(total / itemsPerPage),
        artists,
      });
    });
};

const update = (req, res) => {
  // recoger id del artista por la url
  const artistId = req.params.id;

  // recoger datos por put
  const params = req.body;

  // actualizar el artista

  Artist.findByIdAndUpdate(
    artistId,
    params,
    { new: true },
    (err, artistUpdated) => {
      if (err || !artistUpdated) {
        return res.status(400).json({
          status: "error",
          message: "No se ha podido actualizar el artista",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Accion de actualizar artista",
        artist: artistUpdated,
      });
    },
  );
};

const remove = async (req, res) => {
  // recoger id del artista por la url
  const artistId = req.params.id;

  // consultar buscar y eliminar el artista
  try {
    const artistRemoved = await Artist.findByIdAndDelete(artistId);
    // remove de albums
    const albumRemoved = await Album.find({ artist: artistId });

    albumRemoved.forEach(async (album) => {
      await Song.find({ album: album._id }).remove();
      album.remove();
    });

    // remove de songs
    //const songRemoved = await Song.find({ album: albumRemoved._id }).remove();
    if (!artistRemoved) {
      return res.status(404).json({
        status: "error",
        message: "El artista no existe",
      });
    }

    // devolver resultado
    return res.status(200).json({
      status: "success",
      message: "Artista eliminado",
      artist: artistRemoved,
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: "No se ha podido eliminar el artista",
      error: err.message,
    });
  }
};

const upload = async (req, res) => {
  // Recoger fichero de imagen y comprobar si se ha subido

  let artistId = req.params.id;

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

  Artist.findByIdAndUpdate(
    { _id: artistId },
    { image: req.file.filename },
    { new: true },
    (err, artistUpdated) => {
      if (err || !artistUpdated) {
        return res.status(500).json({
          status: "error",
          message: "Error al guardar la imagen de artist",
        });
      }

      return res.status(200).json({
        status: "success",
        artist: artistUpdated,
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
  const filePath = "./uploads/artists/" + fileName;

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
  saveArtist,
  one,
  list,
  update,
  remove,
  upload,
  avatar,
};
