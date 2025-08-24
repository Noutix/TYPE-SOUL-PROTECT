// src/commands/utilitaires/unlock.js
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "unlock",
  description: "Déverrouille le salon (les membres peuvent écrire à nouveau).",
  // 🔓 Seuls les admins/fondateurs verront la commande
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
        SendMessages: true,
      });

      await interaction.reply(`🔓 Le salon ${channel} a été déverrouillé.`);
    } catch (err) {
      console.error("Erreur /unlock :", err);
      await interaction.reply({
        content: "❌ Impossible de déverrouiller ce salon.",
        ephemeral: true,
      });
    }
  },
};
