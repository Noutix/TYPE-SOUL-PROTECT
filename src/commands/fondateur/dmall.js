// src/commands/admin/dmall.js
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "dmall",
  description: "Envoie un message privé à tous les membres du serveur (Fondateur uniquement).",

  options: [
    {
      name: "message",
      description: "Le message à envoyer.",
      type: 3, // STRING
      required: true,
    },
  ],

  async execute(interaction) {
    // ✅ Vérifie si l'utilisateur est le fondateur
    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Accès refusé")
            .setDescription("Seul **le fondateur du serveur** peut utiliser cette commande."),
        ],
        ephemeral: true,
      });
    }

    const message = interaction.options.getString("message");
    const members = await interaction.guild.members.fetch();

    let success = 0;
    let failed = 0;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Blue")
          .setTitle("📩 Envoi en cours...")
          .setDescription("Je commence à envoyer les messages privés..."),
      ],
      ephemeral: true,
    });

    for (const member of members.values()) {
      if (member.user.bot) continue; // ignore les bots
      try {
        await member.send(message);
        success++;
      } catch {
        failed++;
      }
    }

    const resultEmbed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ DM envoyés")
      .setDescription(
        `Message :\n\`\`\`${message}\`\`\`\n\n📩 Envoyés : **${success}**\n❌ Échoués : **${failed}**`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [resultEmbed] });
  },
};
