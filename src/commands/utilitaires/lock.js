// src/commands/utilitaires/lock.js
module.exports = {
  name: "lock",
  description: "Verrouille le salon (empêche les membres d’écrire).",

  async execute(interaction) {
    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      });

      await interaction.reply(`🔒 Le salon ${channel} a été verrouillé.`);
    } catch (err) {
      console.error("Erreur /lock :", err);
      await interaction.reply({ content: "❌ Impossible de verrouiller ce salon.", ephemeral: true });
    }
  },
};
