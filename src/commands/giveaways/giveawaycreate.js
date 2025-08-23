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

    // Embed stylé
    const embed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY 🎉")
      .setDescription(`**${prize}**\n\nRéagis avec 🎉 pour participer !`)
      .addFields(
        { name: "⏳ Durée", value: `\`${durationStr}\``, inline: true },
        { name: "👥 Gagnants", value: `\`${winnersCount}\``, inline: true },
        { name: "👑 Host", value: `<@${interaction.user.id}>`, inline: true }
      )
      .setFooter({ text: `Finira le ${endAt.toLocaleString()}` })
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
    });
  },
};
