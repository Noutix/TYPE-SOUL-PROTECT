// commands/giveaway/lancer.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");
const parseDuration = require("../../utils/parseDuration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-create")
    .setDescription("🎉 Lancer un giveaway")
    .addStringOption(opt =>
      opt.setName("prix").setDescription("🎁 Le prix du giveaway").setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("gagnants").setDescription("👥 Nombre de gagnants").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("temps").setDescription("⏳ Durée (ex: 1d, 2h, 30m, 45s)").setRequired(true)
    ),

  async execute(interaction) {
    const prize = interaction.options.getString("prix");
    const winnersCount = interaction.options.getInteger("gagnants");
    const durationStr = interaction.options.getString("temps");

    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
      return interaction.reply({
        content: "⚠️ Durée invalide ! Exemple: `1d`, `2h`, `30m`, `45s`",
        ephemeral: true,
      });
    }

    const endAt = new Date(Date.now() + durationMs);

    // Calcul du temps restant en format lisible
    const remaining = `<t:${Math.floor(endAt.getTime() / 1000)}:R>`; // ex: "dans 2 minutes"

    // Embed stylé comme ton screen
    const embed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY 🎉")
      .setDescription(
        `**${prize}**\n\nRéagis avec 🎉 pour participer !\nFin dans : ${remaining}`
      )
      .setColor("Random")
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react("🎉");

    // Sauvegarde en DB
    await Giveaway.create({
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      messageId: msg.id,
      hostId: interaction.user.id,
      prize,
      winnersCount,
      endAt,
      ended: false,
    });
  },
};
