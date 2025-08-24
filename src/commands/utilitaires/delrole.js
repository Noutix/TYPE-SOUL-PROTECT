// src/commands/moderation/delrole.js
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delrole")
    .setDescription("Retire un rôle à un membre.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 Visible seulement Admins/Fondateurs
    .addUserOption(option =>
      option.setName("membre")
        .setDescription("Le membre à qui retirer le rôle.")
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("Le rôle à retirer.")
        .setRequired(true)
    ),

  botPermissions: ["ManageRoles"],

  async execute(interaction) {
    const user = interaction.options.getUser("membre");
    const role = interaction.options.getRole("role");
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.roles.cache.has(role.id)) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor("Red")
          .setTitle("⚠️ Retrait de rôle impossible")
          .setDescription(`${member} n'a pas le rôle ${role}.`)
          .setTimestamp()],
        ephemeral: true,
      });
    }

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Erreur de hiérarchie")
          .setDescription(`Je ne peux pas retirer le rôle ${role} car il est supérieur ou égal à ma position.`)
          .setTimestamp()],
        ephemeral: true,
      });
    }

    try {
      await member.roles.remove(role);

      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ Rôle retiré avec succès")
          .setDescription(`${role} a été retiré à ${member}.`)
          .setTimestamp()],
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor("Red")
          .setTitle("❌ Erreur")
          .setDescription("Impossible de retirer le rôle.")
          .setTimestamp()],
        ephemeral: true,
      });
    }
  },
};
