const { Schema, model } = require("mongoose");

const AlbumSchema = Schema({
  artist: {
    type: Schema.Types.ObjectId,
    ref: "Artist",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String
  },
  year: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: "default-album.png",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Album", AlbumSchema, "albums");
