// src/handlers/sanctionRemoveHandler.js
const Sanction = require("../models/Sanction.js");

module.exports = async function sanctionRemoveHandler(interaction) {
  try {
    // ✅ Gestion des boutons
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("remove_yes_")) {
        const sanctionId = interaction.customId.replace("remove_yes_", "");
        await Sanction.deleteOne({ _id: sanctionId });

        return interaction.update({
          content: `✅ La sanction a été supprimée.`,
          embeds: [],
          components: []
        });
      }

      if (interaction.customId.startsWith("remove_no_")) {
        return interaction.update({
          content: `❌ Suppression annulée.`,
          embeds: [],
          components: []
        });
      }
    }

    // ✅ Gestion du menu déroulant
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith("remove_select_")) {
      const sanctionId = interaction.values[0];
      await Sanction.deleteOne({ _id: sanctionId });

      return interaction.update({
        content: `✅ Sanction supprimée avec succès.`,
        components: []
      });
    }
  } catch (err) {
    console.error("❌ Erreur sanctionRemoveHandler :", err);

    if (!interaction.replied) {
      return interaction.reply({
        content: "⚠️ Une erreur est survenue lors de la suppression.",
        ephemeral: true
      });
    }
  }
};
