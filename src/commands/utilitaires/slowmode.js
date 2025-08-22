// src/commands/moderation/slowmode.js
module.exports = {
  name: "slowmode",
  description: "Définit le slowmode (mode lent) d’un salon en secondes.",

  options: [
    {
      name: "seconds",
      description: "Durée du slowmode en secondes (0 = désactiver).",
      type: 4, // INTEGER
      required: true,
    },
    {
      name: "channel",
      description: "Le salon où appliquer le slowmode (par défaut: le salon actuel).",
      type: 7, // CHANNEL
      required: false,
    },
  ],

  permissionsRequired: ["ManageChannels"],
  botPermissions: ["ManageChannels"],

  async execute(interaction) {
    const seconds = interaction.options.getInteger("seconds");
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    if (seconds < 0 || seconds > 21600) {
      return interaction.reply({
        content: "❌ Le slowmode doit être compris entre 0 et 21600 secondes (6h).",
        ephemeral: true,
      });
    }

    try {
      await channel.setRateLimitPerUser(seconds);

      await interaction.reply({
        content: `✅ Slowmode défini sur **${seconds} seconde(s)** dans ${channel}.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Impossible de modifier le slowmode de ce salon.",
        ephemeral: true,
      });
    }
  },
};
