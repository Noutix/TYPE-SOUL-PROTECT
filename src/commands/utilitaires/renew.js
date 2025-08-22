// src/commands/utilitaires/renew.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("renew")
    .setDescription("Recrée le salon actuel (utile pour repartir de zéro).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), // seuls les modérateurs par défaut

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const channel = interaction.channel;

    try {
      await interaction.reply({
        content: "🔄 Le salon est en train d’être recréé...",
        ephemeral: true,
      });

      // Cloner le salon
      const newChannel = await channel.clone();

      // Remettre la position du salon pour qu’il reste au même endroit
      await newChannel.setPosition(channel.position);

      // Supprimer l’ancien salon
      await channel.delete();

      // Envoyer un message dans le nouveau salon
      await newChannel.send(`✅ Salon recréé par ${interaction.user}.`);

    } catch (err) {
      console.error("Erreur dans /renew :", err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ Impossible de recréer le salon.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Impossible de recréer le salon.",
          ephemeral: true,
        });
      }
    }
  },
};
