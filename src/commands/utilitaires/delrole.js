// src/commands/moderation/delrole.js
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "delrole",
  description: "Retire un rôle à un membre.",

  options: [
    {
      name: "membre",
      description: "Le membre à qui retirer le rôle.",
      type: 6, // USER
      required: true,
    },
    {
      name: "role",
      description: "Le rôle à retirer.",
      type: 8, // ROLE
      required: true,
    },
  ],

  permissionsRequired: ["ManageRoles"],
  botPermissions: ["ManageRoles"],

  async execute(interaction) {
    const user = interaction.options.getUser("membre");
    const role = interaction.options.getRole("role");
    const member = await interaction.guild.members.fetch(user.id);

    // Vérifie si le membre a le rôle
    if (!member.roles.cache.has(role.id)) {
      const noRoleEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("⚠️ Retrait de rôle impossible")
        .setDescription(`${member} n'a pas le rôle ${role}.`)
        .setTimestamp();

      return interaction.reply({ embeds: [noRoleEmbed], ephemeral: true });
    }

    // Vérifie si le bot peut retirer le rôle
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      const hierarchyEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erreur de hiérarchie")
        .setDescription(
          `Je ne peux pas retirer le rôle ${role} car il est supérieur ou égal à ma position.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [hierarchyEmbed], ephemeral: true });
    }

    try {
      await member.roles.remove(role);

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Rôle retiré avec succès")
        .setDescription(`${role} a été retiré à ${member}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      console.error(err);

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erreur")
        .setDescription("Impossible de retirer le rôle.")
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
