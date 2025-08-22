module.exports = {
  name: "reply",
  description: "Répond à un utilisateur",
  options: [
    {
      name: "message",
      description: "Le message à envoyer",
      type: 3, // STRING
      required: true,
    },
  ],
  callback: (client, interaction) => {
    const message = interaction.options.getString("message");
    interaction.reply(message);
  },
};
