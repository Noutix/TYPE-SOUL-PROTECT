const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  prize: { type: String, required: true },
  winnersCount: { type: Number, default: 1 },
  endAt: { type: Number, required: true },
  ended: { type: Boolean, default: false }
});

module.exports = mongoose.model("Giveaway", giveawaySchema);
