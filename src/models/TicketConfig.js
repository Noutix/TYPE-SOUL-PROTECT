const { Schema, model } = require("mongoose");

const TicketConfigSchema = new Schema({
  guildId: { type: String, required: true },
  categoryId: { type: String, required: true }, // <-- ajout !
  channelId: { type: String },
  messageId: { type: String },
  embed: {
    title: String,
    description: String,
    color: String,
    image: String,
  },
  supportRole1: { type: String },
  supportRole2: { type: String },
  supportRole3: { type: String },
});

module.exports = model("TicketConfig", TicketConfigSchema);
