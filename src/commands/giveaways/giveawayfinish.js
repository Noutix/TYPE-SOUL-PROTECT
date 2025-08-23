const { SlashCommandBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-finish")
    .setDescription("Terminer un giveaway manuellement")
    .addStringOption(option =>
      option
        .setName("message_id")
        .setDescription("ID du message du giveaway")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const messageId = interaction.options.getString("message_id");

    try {
      // Chercher le giveaway dans la base de données
      const giveaway = await Giveaway.findOne({ messageId });

      if (!giveaway) {
        return interaction.reply({
          content: "⚠️ Aucun giveaway trouvé avec cet ID.",
          ephemeral: true
        });
      }

      if (giveaway.ended) {
        return interaction.reply({
          content: "⚠️ Ce giveaway est déjà terminé.",
          ephemeral: true
        });
      }

      // Forcer la fin en mettant endAt au passé
      giveaway.endAt = Date.now();
      await giveaway.save();

      interaction.reply({
        content: `✅ Le giveaway **${giveaway.prize}** va se terminer dans moins d'une minute.`,
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Erreur dans giveaway-finish :", error);
      interaction.reply({
        content: "❌ Une erreur est survenue lors de l'arrêt du giveaway.",
        ephemeral: true
      });
    }
  }
};
