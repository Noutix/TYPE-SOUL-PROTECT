const mongoose = require("mongoose");

const sanctionSchema = new mongoose.Schema({
  userId: { type: String, required: true },      // ID de l’utilisateur sanctionné
  guildId: { type: String, required: true },     // ID du serveur
  moderatorId: { type: String, required: true }, // ID du modérateur
  type: { type: String, required: true },        // warn, mute, ban...
  reason: { type: String, default: "Aucune raison" }, // raison
  date: { type: Date, default: Date.now }        // date de sanction
});

module.exports = mongoose.model("Sanction", sanctionSchema);
