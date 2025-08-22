const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const snipes = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Affiche le dernier message supprimé dans le salon"),

  async execute(interaction) {
    const snipe = snipes.get(interaction.channel.id);

    if (!snipe) {
      return interaction.reply({
        content: "❌ Aucun message supprimé récemment dans ce salon.",
        ephemeral: true, // réponse cachée pour éviter le spam
      });
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: snipe.author.tag,
        iconURL: snipe.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(snipe.content || "*[Message vide]*")
      .setFooter({ text: `Supprimé le ${snipe.date.toLocaleString()}` })
      .setColor("#ff5555");

    if (snipe.image) {
      embed.setImage(snipe.image);
    }

    return interaction.reply({ embeds: [embed] });
  },

  snipes, // exportation de la Map
};
