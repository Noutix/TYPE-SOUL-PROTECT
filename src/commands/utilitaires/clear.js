// src/commands/moderation/clear.js
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Supprime un certain nombre de messages dans le salon.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 Seulement Admins/Fondateurs
    .addIntegerOption(option =>
      option.setName("nombre")
        .setDescription("Nombre de messages à supprimer (1-100).")
        .setRequired(true)
    ),

  botPermissions: ["ManageMessages"],

  async execute(interaction) {
    const amount = interaction.options.getInteger("nombre");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Erreur")
            .setDescription("Le nombre doit être entre **1 et 100**."),
        ],
        ephemeral: true,
      });
    }

    try {
      const messages = await interaction.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Messages supprimés")
        .setDescription(`🧹 J'ai supprimé **${messages.size}** messages.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Erreur")
            .setDescription("Impossible de supprimer les messages."),
        ],
        ephemeral: true,
      });
    }
  },
};
