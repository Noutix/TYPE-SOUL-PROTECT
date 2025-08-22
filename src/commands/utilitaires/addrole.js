// src/commands/moderation/addrole.js
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "addrole",
  description: "Ajoute un rôle à un membre.",

  options: [
    {
      name: "membre",
      description: "Le membre à qui donner le rôle.",
      type: 6, // USER
      required: true,
    },
    {
      name: "role",
      description: "Le rôle à donner.",
      type: 8, // ROLE
      required: true,
    },
  ],

  permissionsRequired: ["ManageRoles"],
  botPermissions: ["ManageRoles"],

  async execute(interaction) {
    const user = interaction.options.getUser("membre");
    const role = interaction.options.getRole("role");
    const member = await interaction.guild.members.fetch(user.id);

    // Vérifie si le membre a déjà le rôle
    if (member.roles.cache.has(role.id)) {
      const alreadyEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("⚠️ Rôle déjà attribué")
        .setDescription(`${member} possède déjà le rôle ${role}.`)
        .setTimestamp();

      return interaction.reply({ embeds: [alreadyEmbed], ephemeral: true });
    }

    // Vérifie si le bot peut donner le rôle
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      const hierarchyEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erreur de hiérarchie")
        .setDescription(
          `Je ne peux pas donner le rôle ${role} car il est supérieur ou égal à ma position.`
        )
        .setTimestamp();

      return interaction.reply({ embeds: [hierarchyEmbed], ephemeral: true });
    }

    try {
      await member.roles.add(role);

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Rôle ajouté avec succès")
        .setDescription(`${role} a été ajouté à ${member}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      console.error(err);

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Erreur")
        .setDescription("Impossible d’ajouter le rôle.")
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
