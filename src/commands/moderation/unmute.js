const { 
  ApplicationCommandOptionType, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');

module.exports = {
  callback: async (interaction, client) => {
    if (!interaction.isChatInputCommand()) {
      return interaction.reply({ content: "❌ Cette commande doit être utilisée en slash.", ephemeral: true });
    }

    const target = interaction.options.getUser('membre');
    if (!target) {
      return interaction.reply({ content: "❌ Aucun membre fourni.", ephemeral: true });
    }

    const reason = interaction.options.getString('raison') || 'Pas de raison fourni';

    await interaction.deferReply({ ephemeral: true });

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) return interaction.editReply("❌ Ce membre n'est pas sur le serveur.");

    // Vérification hiérarchie
    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.editReply("❌ Vous ne pouvez pas unmute ce membre (hiérarchie de rôle trop élevée).");
    }

    try {
      await targetMember.timeout(null, reason); // ⚡ null = supprime le mute

      // ✅ Embed envoyé en DM
      const dmEmbed = new EmbedBuilder()
        .setTitle("🔊 Vous avez été unmute")
        .setColor("Green")
        .setDescription(`Votre mute a été retiré sur **${interaction.guild.name}**`)
        .addFields(
          { name: "📄 Raison", value: reason, inline: true },
          { name: "👮 Modérateur", value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      try {
        await target.send({ embeds: [dmEmbed] });
      } catch {
        console.log(`⚠️ Impossible d’envoyer le DM à ${target.tag}`);
      }

      // ✅ Embed public
      const embed = new EmbedBuilder()
        .setTitle("🔊 Sanction levée")
        .setColor("Green")
        .setDescription(`Le membre ${targetMember} (${targetMember.id}) a été **unmute**.`)
        .addFields({ name: "Raison", value: reason })
        .setFooter({ text: `Action effectuée par ${interaction.user.tag}` })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

      await interaction.editReply(`✅ ${targetMember} a bien été unmute.`);
    } catch (err) {
      console.log(err);
      await interaction.editReply("⚠️ Erreur pendant l’unmute.");
    }
  },

  name: 'unmute',
  description: 'Retire le mute d’un membre.',
  options: [
    {
      name: 'membre',
      description: 'Le membre que vous voulez unmute.',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'raison',
      description: 'La raison de l’unmute.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
};
