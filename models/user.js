// modelo de usuario
const { Schema, model } = require("mongoose");

// crear esquema
const UserSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String },
  nick: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: "ROLE_USER", select: false },
  image: { type: String , default: "default.png" },
  created_at: { type: Date, default: Date.now },
});

// exportar modelo
module.exports = model("User", UserSchema, "users");