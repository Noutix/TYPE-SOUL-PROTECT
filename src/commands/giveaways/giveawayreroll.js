// commands/giveaway/reroll.js
const { SlashCommandBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-reroll")
    .setDescription("🎉 Relancer un giveaway et tirer de nouveaux gagnants")
    .addStringOption(opt =>
      opt.setName("messageid")
        .setDescription("🆔 ID du message du giveaway")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("gagnants")
        .setDescription("Nombre de gagnants à relancer (par défaut 1)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const messageId = interaction.options.getString("messageid");
    const rerollCount = interaction.options.getInteger("gagnants") || 1;

    // Cherche le giveaway en DB
    const giveaway = await Giveaway.findOne({ messageId });
    if (!giveaway) {
      return interaction.reply({
        content: "⚠️ Aucun giveaway trouvé avec cet ID.",
        ephemeral: true,
      });
    }

    if (giveaway.status !== "FINISHED") {
      return interaction.reply({
        content: "⚠️ Ce giveaway n’est pas encore terminé.",
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
      return interaction.reply({
        content: "❌ Personne n’avait participé au giveaway...",
        ephemeral: true,
      });
    }

    // Tire les nouveaux gagnants
    const winners = [];
    for (let i = 0; i < rerollCount; i++) {
      const winner = participants[Math.floor(Math.random() * participants.length)];
      if (winner && !winners.includes(winner)) winners.push(winner);
    }

    await msg.reply(
      `🔄 Nouveau tirage (${rerollCount} gagnant${rerollCount > 1 ? "s" : ""}) ! 🎉 Félicitations ${winners.map(w => `<@${w}>`).join(", ")}`
    );

    return interaction.reply({
      content: `✅ Giveaway reroll effectué avec succès (${rerollCount} gagnant${rerollCount > 1 ? "s" : ""}).`,
      ephemeral: true,
    });
  },
};
