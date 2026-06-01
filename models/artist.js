const { Schema, model } = require("mongoose");

const ArtistSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  // albums: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: "Album",
  //   },
  // ],
});
module.exports = model("Artist", ArtistSchema, "artists");
