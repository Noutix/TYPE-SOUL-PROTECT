const { 
  ApplicationCommandOptionType, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');
const ms = require('ms');
const Sanction = require("../../models/Sanction.js");

module.exports = {
  callback: async (interaction, client) => {
    if (!interaction.isChatInputCommand()) {
      return interaction.reply({ content: "❌ Cette commande doit être utilisée en slash.", ephemeral: true });
    }

    const target = interaction.options.getUser('membre');
    if (!target) {
      return interaction.reply({ content: "❌ Aucun membre fourni.", ephemeral: true });
    }

    const duration = interaction.options.getString('durée');
    const reason = interaction.options.getString('raison') || 'Pas de raison fourni';

    await interaction.deferReply({ ephemeral: true });

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) return interaction.editReply("❌ Ce membre n'est pas sur le serveur.");

    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.editReply("❌ Vous ne pouvez pas mute ce membre (hiérarchie de rôle trop élevée).");
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) return interaction.editReply('❌ Durée invalide.');

    try {
      const { default: prettyMs } = await import('pretty-ms');
      await targetMember.timeout(msDuration, reason);

      // ✅ Enregistrement en DB
      await Sanction.create({
        userId: target.id,
        guildId: interaction.guild.id,
        moderatorId: interaction.user.id,
        type: "mute",
        reason,
        duration: msDuration,
        date: new Date()
      });

      // ✅ DM
      const dmEmbed = new EmbedBuilder()
        .setTitle("🔇 Vous avez été sanctionné")
        .setColor("Orange")
        .setDescription(`Vous avez été mute sur **${interaction.guild.name}**`)
        .addFields(
          { name: "⏳ Durée", value: prettyMs(msDuration, { verbose: true }), inline: true },
          { name: "📄 Raison", value: reason, inline: true },
          { name: "👮 Modérateur", value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      try { await target.send({ embeds: [dmEmbed] }); } catch {}

      // ✅ Public
      const embed = new EmbedBuilder()
        .setTitle("🔇 Sanction appliquée")
        .setColor("Red")
        .setDescription(
          `Le membre ${targetMember} (${targetMember.id}) a été **mute** ${prettyMs(msDuration, { verbose: true })}.`
        )
        .addFields({ name: "Raison", value: reason })
        .setFooter({ text: `Sanction appliquée par ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.editReply(`✅ ${targetMember} a bien été mute.`);
    } catch (err) {
      console.log(err);
      await interaction.editReply("⚠️ Erreur pendant le mute.");
    }
  },

  name: 'mute',
  description: 'Mute un membre.',
  options: [
    {
      name: 'membre',
      description: 'Le membre que vous voulez mute.',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'durée',
      description: 'Combien de temps (30m, 1h, 1 jour).',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'raison',
      description: 'La raison du mute.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
};
