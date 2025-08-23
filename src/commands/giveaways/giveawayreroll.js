const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveawayreroll")
    .setDescription("🎉 Relance un tirage pour un giveaway terminé")
    .addStringOption(option =>
      option.setName("id")
        .setDescription("L'ID du giveaway")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const giveaway = await Giveaway.findById(id);

    if (!giveaway) {
      return interaction.reply({ content: "❌ Giveaway introuvable.", ephemeral: true });
    }

    if (!giveaway.ended) {
      return interaction.reply({ content: "❌ Ce giveaway n'est pas encore terminé.", ephemeral: true });
    }

    try {
      const channel = await interaction.client.channels.fetch(giveaway.channelId);
      const message = await channel.messages.fetch(giveaway.messageId);

      const users = (await message.reactions.cache.get("🎉")?.users.fetch())?.filter(u => !u.bot);
      if (!users || users.size === 0) {
        return interaction.reply({ content: "❌ Aucun participant trouvé.", ephemeral: true });
      }

      // Nouveau tirage
      const winners = users.random(giveaway.winners);

      const embed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY REROLL 🎉")
        .setDescription(`Nouveaux gagnants pour **${giveaway.prize}** : ${winners.map(w => w.toString()).join(", ")}`)
        .setColor("Orange");

      await channel.send({ embeds: [embed] });

      return interaction.reply({ content: "✅ Nouveau tirage effectué !", ephemeral: true });

    } catch (err) {
      console.error(err);
      return interaction.reply({ content: "❌ Erreur lors du reroll.", ephemeral: true });
    }
  }
};
