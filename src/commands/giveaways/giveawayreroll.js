const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-reroll")
    .setDescription("🎉 Relancer un gagnant pour un giveaway terminé.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("L'ID du message du giveaway")
        .setRequired(true)
    ),

  async execute(interaction) {
    const messageId = interaction.options.getString("id");

    const giveaway = await Giveaway.findOne({ messageId });
    if (!giveaway) {
      return interaction.reply({ content: "⚠️ Aucun giveaway trouvé avec cet ID.", ephemeral: true });
    }

    if (!giveaway.ended) {
      return interaction.reply({ content: "⚠️ Ce giveaway n'est pas encore terminé.", ephemeral: true });
    }

    try {
      const channel = await interaction.client.channels.fetch(giveaway.channelId);
      const message = await channel.messages.fetch(giveaway.messageId);

      const reaction = message.reactions.cache.get("🎉");
      const users = (await reaction.users.fetch()).filter(u => !u.bot);

      if (!users.size) {
        return interaction.reply({ content: "❌ Aucun participant trouvé.", ephemeral: true });
      }

      // Nouveau gagnant
      const winner = users.random();

      // === Embed mis à jour ===
      const rerollEmbed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY TERMINÉ 🎉")
        .setDescription(`${giveaway.prize}`)
        .addFields(
          { name: "Nouveau gagnant 🎉", value: `${winner}` },
          { name: "Reroll effectué à", value: `<t:${Math.floor(Date.now() / 1000)}:f>` }
        )
        .setColor("Orange");

      // Mets à jour le message original avec le nouveau gagnant
      await message.edit({ embeds: [rerollEmbed] });

      // Envoie un message pour ping le nouveau gagnant juste après
      await channel.send(`🎉 Félicitations ${winner} ! Tu as gagné **${giveaway.prize}** 🎁`);

      return interaction.reply({ content: `✅ Nouveau gagnant tiré : ${winner}`, ephemeral: true });

    } catch (err) {
      console.error(err);
      return interaction.reply({ content: "❌ Une erreur est survenue lors du reroll.", ephemeral: true });
    }
  },
};
