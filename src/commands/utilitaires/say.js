// src/commands/utilitaires/say.js
module.exports = {
  name: "say",
  description: "Fait parler le bot en envoyant un message.",

  options: [
    {
      name: "message",
      description: "Le texte que le bot doit envoyer",
      type: 3, // STRING
      required: true,
    },
  ],

  async execute(interaction) {
    const message = interaction.options.getString("message");

    // On supprime la commande pour cacher que quelqu'un l'a faite
    await interaction.reply({ content: "✅ Message envoyé.", ephemeral: true });

    // Le bot envoie le message
    await interaction.channel.send(message);
  },
};
