// imporrtar dependencias
const express = require("express");
const check = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/albums/");
  },
  filename: function (req, file, cb) {
    cb(null, "album-" + Date.now() + "-" + file.originalname);
  },
});

// configurar multer
const upload = multer({ storage });

// cargar router
const router = express.Router();

// importar controladores
const AlbumController = require("../controllers/album");

// definir rutas
router.get("/prueba-album", AlbumController.prueba);
router.post("/save-album", check.auth, AlbumController.saveAlbum);
router.get("/album/:id", check.auth, AlbumController.one);
router.get("/albums-list/:id", check.auth, AlbumController.list);
router.put("/album/:id", check.auth, AlbumController.update);
router.post(
  "/upload-image/:id",
  [check.auth, upload.single("file0")],
  AlbumController.upload,
);
router.get("/image/:filename", AlbumController.avatar);
router.delete("/remove/:id", check.auth, AlbumController.remove);

// exportar rutas
module.exports = router;
