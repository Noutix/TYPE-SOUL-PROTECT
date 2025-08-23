const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveawayfinish")
    .setDescription("🎉 Termine un giveaway manuellement")
    .addStringOption(option =>
      option.setName("id")
        .setDescription("ID du giveaway à terminer")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const giveaway = await Giveaway.findById(id);

    if (!giveaway) {
      return interaction.reply({ content: "❌ Aucun giveaway trouvé avec cet ID.", ephemeral: true });
    }
    if (giveaway.ended) {
      return interaction.reply({ content: "❌ Ce giveaway est déjà terminé.", ephemeral: true });
    }

    const channel = await interaction.guild.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);

    // Récup participation
    const reaction = message.reactions.cache.get("🎉");
    if (!reaction) return interaction.reply("❌ Personne n’a participé à ce giveaway.");
    await reaction.users.fetch();
    const participants = reaction.users.cache.filter(u => !u.bot);

    // Sélection des gagnants
    const winners = [];
    for (let i = 0; i < giveaway.winners; i++) {
      const winner = participants.random();
      if (winner && !winners.includes(winner)) winners.push(winner);
    }

    // Embed terminé
    const embed = EmbedBuilder.from(message.embeds[0])
      .setTitle("🎉 GIVEAWAY TERMINÉ 🎉")
      .setColor("Red")
      .setFooter({ text: `Terminé à • ${new Date().toLocaleString("fr-FR")}` })
      .addFields({
        name: "Gagnant(s)",
        value: winners.length > 0 ? winners.map(w => `${w}`).join(", ") : "Aucun gagnant"
      });

    await message.edit({ embeds: [embed] });

    if (winners.length > 0) {
      await channel.send(`🎉 Félicitations ${winners.map(w => w).join(", ")} ! Vous avez gagné **${giveaway.prize}** !`);
    } else {
      await channel.send("❌ Aucun gagnant n’a été tiré.");
    }

    giveaway.ended = true;
    await giveaway.save();

    interaction.reply({ content: "✅ Giveaway terminé avec succès.", ephemeral: true });
  }
};
