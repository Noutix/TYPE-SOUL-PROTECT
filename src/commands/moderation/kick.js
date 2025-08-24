const { 
  SlashCommandBuilder,
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');
const Sanction = require("../../models/Sanction.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 Expulser un membre du serveur.')
    .addUserOption(option =>
      option.setName('membre')
        .setDescription('Le membre que vous voulez expulser.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('raison')
        .setDescription('La raison du kick.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) // ✅ seuls ceux qui ont la perm kick voient la commande
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // 🔒 Sécurité supplémentaire côté code
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: "❌ Tu n’as pas la permission d’expulser un membre.", ephemeral: true });
    }

    const targetUser = interaction.options.getUser('membre');
    const reason = interaction.options.getString('raison') || 'Pas de raison fourni';

    await interaction.deferReply({ ephemeral: true });

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) return interaction.editReply("❌ Ce membre n'est pas dans le serveur.");

    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.editReply("❌ Vous ne pouvez pas expulser ce membre (hiérarchie de rôle trop élevée).");
    }

    try {
      // ✅ DM avant le kick
      const dmEmbed = new EmbedBuilder()
        .setTitle("👢 Vous avez été expulsé")
        .setColor("Orange")
        .setDescription(`Vous avez été expulsé de **${interaction.guild.name}**`)
        .addFields(
          { name: "📄 Raison", value: reason, inline: true },
          { name: "👮 Modérateur", value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      try { await member.send({ embeds: [dmEmbed] }); } catch {}

      await member.kick(reason);

      // ✅ Enregistrement en DB
      await Sanction.create({
        userId: targetUser.id,
        guildId: interaction.guild.id,
        moderatorId: interaction.user.id,
        type: "kick",
        reason,
        date: new Date()
      });

      // ✅ Public
      const embed = new EmbedBuilder()
        .setTitle("👢 Sanction appliquée")
        .setColor("Red")
        .setDescription(`Le membre ${targetUser} (${targetUser.id}) a été **expulsé**.`)
        .addFields({ name: "Raison", value: reason })
        .setFooter({ text: `Sanction appliquée par ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.editReply(`✅ ${targetUser.tag} a bien été expulsé.`);
    } catch (err) {
      console.log(err);
      await interaction.editReply("⚠️ Erreur pendant l'expulsion.");
    }
  },
};
