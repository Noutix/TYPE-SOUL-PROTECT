const { Schema, model } = require("mongoose");

const giveawaySchema = new Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  hostId: { type: String, required: true },
  prize: { type: String, required: true },
  winners: { type: Number, required: true }, // nombre de gagnants
  endAt: { type: Number, required: true },   // timestamp (Date.now() + durée)
  ended: { type: Boolean, default: false },  // status du giveaway
});

module.exports = model("Giveaway", giveawaySchema);
