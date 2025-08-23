const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveawaycreate")
    .setDescription("🎉 Crée un giveaway")
    .addStringOption(option =>
      option.setName("prix")
        .setDescription("🎁 Le prix du giveaway")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("gagnants")
        .setDescription("Nombre de gagnants")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("temps")
        .setDescription("Durée en minutes")
        .setRequired(true)
    ),

  async execute(interaction) {
    const prize = interaction.options.getString("prix");
    const winners = interaction.options.getInteger("gagnants");
    const time = interaction.options.getInteger("temps");

    const endAt = Date.now() + time * 60 * 1000;

    // Création de l'embed
    const embed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY 🎉")
      .setDescription(`🎁 **${prize}**\n\nRéagis avec 🎉 pour participer !`)
      .addFields(
        { name: "Nombre de gagnants", value: `${winners}`, inline: true },
        { name: "Se termine le", value: `<t:${Math.floor(endAt / 1000)}:F>`, inline: true }
      )
      .setColor("Green")
      .setFooter({ text: `ID du giveaway : généré automatiquement` });

    // Envoie du message
    const message = await interaction.channel.send({ embeds: [embed] });
    await message.react("🎉");

    // Sauvegarde dans MongoDB
    const giveaway = new Giveaway({
      prize,
      winners,
      endAt,
      channelId: interaction.channel.id,
      messageId: message.id,
      ended: false
    });

    await giveaway.save();

    interaction.reply({ content: `✅ Giveaway lancé pour **${prize}** ! (ID : \`${giveaway.id}\`)`, ephemeral: true });
  }
};
