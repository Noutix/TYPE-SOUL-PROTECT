const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("🔓 Débannir un utilisateur du serveur")
    .addStringOption(option =>
      option.setName("id")
        .setDescription("L'ID de l’utilisateur à débannir")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("raison")
        .setDescription("La raison du débannissement")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // ✅ visible que si perm ban
    .setDMPermission(false), // pas utilisable en DM

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // 🔒 Sécurité côté code
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission de débannir des membres.",
        ephemeral: true,
      });
    }

    const userId = interaction.options.getString("id");
    const reason = interaction.options.getString("raison") || "Aucune raison fournie";

    try {
      await interaction.guild.members.unban(userId, reason);

      const embed = new EmbedBuilder()
        .setTitle("✅ Débannissement")
        .setColor("Green")
        .addFields(
          { name: "👤 Utilisateur", value: `<@${userId}> (${userId})`, inline: false },
          { name: "🛠️ Modérateur", value: `${interaction.user.tag}`, inline: false },
          { name: "📄 Raison", value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      return interaction.reply({ 
        content: `❌ Impossible de débannir l’utilisateur avec l’ID **${userId}**. Vérifie que l’ID est correct et que la personne est bien bannie.`,
        ephemeral: true 
      });
    }
  },
};
