// src/commands/utilitaires/lock.js
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "lock",
  description: "Verrouille le salon (empêche les membres d’écrire).",
  // 🔒 Seuls les admins/fondateurs verront la commande dans Discord
  default_member_permissions: PermissionFlagsBits.Administrator,

  async execute(interaction) {
    // Double sécurité : vérifie si l'utilisateur est bien admin
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission d’utiliser cette commande.",
        ephemeral: true,
      });
    }

    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      });

      await interaction.reply(`🔒 Le salon ${channel} a été verrouillé.`);
    } catch (err) {
      console.error("Erreur /lock :", err);
      await interaction.reply({
        content: "❌ Impossible de verrouiller ce salon.",
        ephemeral: true,
      });
    }
  },
};
