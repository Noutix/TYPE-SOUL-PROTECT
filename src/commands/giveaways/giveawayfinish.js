const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-finish")
    .setDescription("Terminer un giveaway manuellement")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 Réservé Admin/Fondateurs
    .addStringOption(option =>
      option
        .setName("message_id")
        .setDescription("ID du message du giveaway")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    // 🔐 Double sécurité
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission de terminer un giveaway.",
        ephemeral: true,
      });
    }

    const messageId = interaction.options.getString("message_id");

    try {
      const giveaway = await Giveaway.findOne({ messageId });

      if (!giveaway) {
        return interaction.reply({
          content: "⚠️ Aucun giveaway trouvé avec cet ID.",
          ephemeral: true,
        });
      }

      if (giveaway.ended) {
        return interaction.reply({
          content: "⚠️ Ce giveaway est déjà terminé.",
          ephemeral: true,
        });
      }

      giveaway.endAt = Date.now();
      await giveaway.save();

      interaction.reply({
        content: `✅ Le giveaway **${giveaway.prize}** va se terminer dans moins d'une minute.`,
        ephemeral: true,
      });

    } catch (error) {
      console.error("❌ Erreur dans giveaway-finish :", error);
      interaction.reply({
        content: "❌ Une erreur est survenue lors de l'arrêt du giveaway.",
        ephemeral: true,
      });
    }
  },
};
