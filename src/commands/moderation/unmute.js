const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("🔊 Retire le mute d’un membre")
    .addUserOption(option =>
      option.setName("membre")
        .setDescription("Le membre que vous voulez unmute.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("raison")
        .setDescription("La raison de l’unmute.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers) // ✅ visible/utilisable seulement avec perm mute
    .setDMPermission(false), // ❌ pas utilisable en DM

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    // 🔒 Vérification côté code
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission de unmute des membres.",
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser("membre");
    const reason = interaction.options.getString("raison") || "Pas de raison fourni";

    await interaction.deferReply({ ephemeral: true });

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!targetMember) {
      return interaction.editReply("❌ Ce membre n'est pas sur le serveur.");
    }

    // Vérification hiérarchie
    if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.editReply("❌ Vous ne pouvez pas unmute ce membre (hiérarchie trop élevée).");
    }

    try {
      await targetMember.timeout(null, reason); // ⚡ Retire le mute

      // ✅ Embed DM
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
      console.error(err);
      await interaction.editReply("⚠️ Erreur pendant l’unmute.");
    }
  },
};
