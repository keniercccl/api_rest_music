// imporrtar dependencias
const express = require("express");
const check = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/avatars/");
  },
  filename: function (req, file, cb) {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});

// configurar multer
const upload = multer({ storage });

// cargar router
const router = express.Router();

// importar controlador
const userController = require("../controllers/user");

// definir rutas
router.get("/prueba-user", check.auth, userController.prueba);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", check.auth, userController.profile);
router.put("/update-user/:id", check.auth, userController.update);
router.post("/upload-avatar", [check.auth, upload.single("avatar")],userController.upload,);
router.get("/avatar/:filename", userController.avatar);

// exportar rutas
module.exports = router;
