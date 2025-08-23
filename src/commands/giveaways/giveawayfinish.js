// commands/giveaway/finish.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-finish")
    .setDescription("🎉 Forcer la fin d’un giveaway")
    .addStringOption(opt =>
      opt.setName("messageid").setDescription("🆔 ID du message du giveaway").setRequired(true)
    ),

  async execute(interaction) {
    const messageId = interaction.options.getString("messageid");

    // Cherche le giveaway en DB
    const giveaway = await Giveaway.findOne({ messageId });
    if (!giveaway) {
      return interaction.reply({
        content: "⚠️ Aucun giveaway trouvé avec cet ID.",
        ephemeral: true,
      });
    }

    if (giveaway.status === "FINISHED") {
      return interaction.reply({
        content: "⚠️ Ce giveaway est déjà terminé.",
        ephemeral: true,
      });
    }

    // Récupère le channel et le message
    const channel = await interaction.guild.channels.fetch(giveaway.channelId);
    const msg = await channel.messages.fetch(giveaway.messageId);

    // Récupère les participants
    const reactions = msg.reactions.cache.get("🎉");
    const users = reactions ? await reactions.users.fetch() : [];
    const participants = users.filter(u => !u.bot).map(u => u.id);

    if (participants.length === 0) {
      await msg.reply("❌ Personne n’a participé au giveaway...");
    } else {
      const winners = [];
      for (let i = 0; i < giveaway.winnersCount; i++) {
        const winner = participants[Math.floor(Math.random() * participants.length)];
        if (winner && !winners.includes(winner)) winners.push(winner);
      }

      await msg.reply(
        `🎉 Félicitations ${winners.map(w => `<@${w}>`).join(", ")} ! Vous avez gagné **${giveaway.prize}**`
      );
    }

    giveaway.status = "FINISHED";
    await giveaway.save();

    return interaction.reply({ content: "✅ Giveaway terminé avec succès.", ephemeral: true });
  },
};
