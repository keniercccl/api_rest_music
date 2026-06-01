// imporrtar dependencias
const express = require("express");
const check = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/artists/");
  },
  filename: function (req, file, cb) {
    cb(null, "artist-" + Date.now() + "-" + file.originalname);
  },
});

// configurar multer
const upload = multer({ storage });

// cargar router
const router = express.Router();

// importar rutas
const ArtistController = require("../controllers/artist");

// definir rutas
router.get("/prueba-artist", ArtistController.prueba);
router.post("/save-artist", check.auth, ArtistController.saveArtist);
router.get("/artist/:id", check.auth, ArtistController.one);
router.get("/artists/:page", check.auth, ArtistController.list);
router.put("/update/:id", check.auth, ArtistController.update);
router.delete("/remove/:id", check.auth, ArtistController.remove);
router.post("/upload-image/:id", [check.auth, upload.single("file0")], ArtistController.upload);
router.get("/image/:filename", ArtistController.avatar);

// exportar rutas
module.exports = router;
