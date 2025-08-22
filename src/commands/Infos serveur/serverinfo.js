const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Affiche les infos du serveur."),

  async execute(interaction) {
    const { guild } = interaction;

    const embed = new EmbedBuilder()
      .setTitle(`📊 Infos sur ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "👑 Propriétaire", value: `<@${guild.ownerId}>`, inline: true },
        { name: "🆔 ID", value: guild.id, inline: true },
        { name: "📅 Créé le", value: `<t:${parseInt(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "👥 Membres", value: `${guild.memberCount}`, inline: true },
        { name: "💬 Salons", value: `${guild.channels.cache.size}`, inline: true },
        { name: "🔖 Rôles", value: `${guild.roles.cache.size}`, inline: true },
        { name: "🚀 Boosts", value: `${guild.premiumSubscriptionCount} (Niveau ${guild.premiumTier})`, inline: true }
      )
      .setColor("Green");

    await interaction.reply({ embeds: [embed] });
  }
};
