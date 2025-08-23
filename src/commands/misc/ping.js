const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Affiche la latence du bot 🛰️"),

  async execute(interaction) {
    const sent = await interaction.reply({ content: "⏳ Calcul en cours...", fetchReply: true });

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("🏓 Pong !")
      .addFields(
        { name: "Latence Bot", value: `\`${sent.createdTimestamp - interaction.createdTimestamp} ms\``, inline: true },
        { name: "Latence API", value: `\`${interaction.client.ws.ping} ms\``, inline: true },
        { name: "Utilisateur", value: `<@${interaction.user.id}>`, inline: true }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.editReply({ content: "", embeds: [embed] });
  },
};
