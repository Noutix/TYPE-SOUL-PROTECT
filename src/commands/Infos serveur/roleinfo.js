const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Affiche les infos d’un rôle.")
    .addRoleOption(option =>
      option.setName("rôle")
        .setDescription("Le rôle dont tu veux voir les infos")
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("rôle");

    const embed = new EmbedBuilder()
      .setTitle(`🎭 Infos sur le rôle : ${role.name}`)
      .setColor(role.color || "Grey")
      .addFields(
        { name: "🆔 ID", value: role.id, inline: true },
        { name: "🎨 Couleur", value: role.hexColor, inline: true },
        { name: "📅 Créé le", value: `<t:${parseInt(role.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "👥 Membres avec ce rôle", value: `${role.members.size}`, inline: true },
        { name: "📌 Mentionnable", value: role.mentionable ? "✅ Oui" : "❌ Non", inline: true },
        { name: "📌 Position", value: `${role.position}`, inline: true },
        { name: "🔐 Permissions", value: role.permissions.toArray().map(p => `\`${p}\``).join(", ") || "Aucune" }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
