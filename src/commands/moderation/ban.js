// src/commands/Moderation/ban.js
const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require("discord.js");
const Sanction = require("../../models/Sanction.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Bannir un utilisateur du serveur.")
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
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) // ✅ seuls ceux qui ont la perm ban voient la commande
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // 🔒 Sécurité supplémentaire
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission de bannir des membres.",
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("membre");
    const reason = interaction.options.getString("raison") || "Pas de raison fournie";

    await interaction.deferReply({ ephemeral: true });

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) return interaction.editReply("❌ Ce membre n'est pas dans le serveur.");

    if (!member.bannable) {
      return interaction.editReply("❌ Je ne peux pas bannir ce membre (peut-être à cause de la hiérarchie ou de mes permissions).");
    }

    try {
      // ✅ DM avant le ban
      const dmEmbed = new EmbedBuilder()
        .setTitle("🚫 Vous avez été banni")
        .setColor("Red")
        .setDescription(`Vous avez été banni de **${interaction.guild.name}**`)
        .addFields(
          { name: "📄 Raison", value: reason, inline: true },
          { name: "👮 Modérateur", value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      try { await member.send({ embeds: [dmEmbed] }); } catch {}

      await member.ban({ reason });

      // ✅ Enregistrement en DB
      await Sanction.create({
        userId: targetUser.id,
        guildId: interaction.guild.id, // 🔥 manquait dans ta version
        moderatorId: interaction.user.id,
        type: "Ban", // 🔥 uniformisé
        reason,
        date: new Date()
      });

      // ✅ Public
      const embed = new EmbedBuilder()
        .setTitle("🚫 Sanction appliquée")
        .setColor("Red")
        .setDescription(`Le membre ${targetUser} (${targetUser.id}) a été **banni**.`)
        .addFields({ name: "Raison", value: reason })
        .setFooter({ text: `Sanction appliquée par ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.editReply(`✅ ${targetUser.tag} a bien été banni.`);
    } catch (err) {
      console.log(err);
      await interaction.editReply("⚠️ Erreur pendant le bannissement.");
    }
  },
};
