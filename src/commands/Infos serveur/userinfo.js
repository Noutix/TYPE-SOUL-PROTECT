const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Affiche les infos d’un membre.")
    .addUserOption(option =>
      option.setName("membre")
        .setDescription("Le membre dont tu veux voir les infos")
        .setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember("membre") || interaction.member;

    const embed = new EmbedBuilder()
      .setTitle(`👤 Infos sur ${member.user.tag}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "🆔 ID", value: member.id, inline: true },
        { name: "📅 Compte créé le", value: `<t:${parseInt(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "📅 A rejoint le serveur", value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: "📌 Rôles", value: member.roles.cache.map(r => r).join(", ").replace(", @everyone", "") || "Aucun rôle" }
      )
      .setColor("Blue");

    await interaction.reply({ embeds: [embed] });
  }
};
