// src/commands/utilitaires/unlock.js
module.exports = {
  name: "unlock",
  description: "Déverrouille le salon (les membres peuvent écrire à nouveau).",

  async execute(interaction) {
    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: true,
      });

      await interaction.reply(`🔓 Le salon ${channel} a été déverrouillé.`);
    } catch (err) {
      console.error("Erreur /unlock :", err);
      await interaction.reply({ content: "❌ Impossible de déverrouiller ce salon.", ephemeral: true });
    }
  },
};
