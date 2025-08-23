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

    // On cherche le giveaway
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
      let winners = users.random(giveaway.winnersCount || 1);
      if (!Array.isArray(winners)) winners = [winners];

      // Mettre à jour l'embed du giveaway terminé
      const rerollEmbed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY TERMINÉ 🎉 (Reroll)")
        .setDescription(`${giveaway.prize}`)
        .addFields(
          { name: "Nouveau gagnant(s)", value: winners.map(w => `${w}`).join(", ") },
          { name: "Reroll effectué à", value: `<t:${Math.floor(Date.now() / 1000)}:f>` }
        )
        .setColor("Orange");

      await message.edit({ embeds: [rerollEmbed], content: null });

      // Envoie un ping clair juste après
      await channel.send(
        `🎉 Félicitations ${winners.map(w => `${w}`).join(", ")} ! Tu as été tiré au sort à nouveau pour **${giveaway.prize}** 🎁`
      );

      return interaction.reply({ content: "✅ Reroll effectué avec succès !", ephemeral: true });
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: "❌ Une erreur est survenue lors du reroll.", ephemeral: true });
    }
  },
};
