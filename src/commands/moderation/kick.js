const { 
  ApplicationCommandOptionType, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');
const Sanction = require("../../models/Sanction.js");

module.exports = {
  callback: async (client, interaction) => {
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

  name: 'kick',
  description: 'Expulser un membre du serveur.',
  options: [
    {
      name: 'membre',
      description: 'Le membre que vous voulez expulser.',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'raison',
      description: 'La raison du kick.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.KickMembers],
  botPermissions: [PermissionFlagsBits.KickMembers],
};
