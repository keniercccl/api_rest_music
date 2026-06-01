const { Schema, model } = require("mongoose");

const SongSchema = Schema({
  album: {
    type: Schema.Types.ObjectId,
    ref: "Album",
    // required: true,
  },
  track: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    default: "default-song.mp3",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Song", SongSchema, "songs");
