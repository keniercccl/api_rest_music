// imporrtar dependencias
const express = require("express");
const check = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/songs/");
  },
  filename: function (req, file, cb) {
    cb(null, "song-" + Date.now() + "-" + file.originalname);
  },
});

// configurar multer
const upload = multer({ storage });

// cargar router
const router = express.Router();

// importar controladores
const SongController = require("../controllers/song");

// definir rutas
router.get("/prueba-song", SongController.prueba);
router.post("/save", check.auth, SongController.saveSong);
router.get("/song/:id", check.auth, SongController.one);
router.get("/list/:album", check.auth, SongController.list);
router.put("/update/:id", check.auth, SongController.update);
router.delete("/remove/:id", check.auth, SongController.remove);
router.post("/file/:id", check.auth, upload.single("file0"), SongController.file);
router.get("/audio/:filename", SongController.audio);

// exportar rutas

module.exports = router;
