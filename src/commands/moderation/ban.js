// src/commands/Moderation/ban.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Sanction = require("../../models/Sanction"); // ✅ Assure-toi que ton modèle existe

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Bannir un utilisateur du serveur")
    .addUserOption(option =>
      option.setName("membre")
        .setDescription("Le membre à bannir")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("raison")
        .setDescription("La raison du bannissement")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // Vérification permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission de bannir des membres.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("membre");
    const reason = interaction.options.getString("raison") || "Aucune raison fournie";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "❌ Ce membre n'est pas dans le serveur.", ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: "❌ Je ne peux pas bannir ce membre.", ephemeral: true });
    }

    // ✅ On ban
    await member.ban({ reason });

    // ✅ On log la sanction en DB
    await Sanction.create({
      userId: user.id,
      type: "Ban",
      reason: reason,
      moderatorId: interaction.user.id,
      date: new Date()
    });

    // ✅ Embed de confirmation
    const embed = new EmbedBuilder()
      .setTitle("🚫 Bannissement")
      .setColor("Red")
      .addFields(
        { name: "👤 Utilisateur", value: `${user.tag} (${user.id})`, inline: false },
        { name: "🛠️ Modérateur", value: `${interaction.user.tag}`, inline: false },
        { name: "📄 Raison", value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
