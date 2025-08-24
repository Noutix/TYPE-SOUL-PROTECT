const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Giveaway = require("../../models/Giveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-reroll")
    .setDescription("🎉 Relancer un gagnant pour un giveaway terminé.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 réservé Admins
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("L'ID du message du giveaway")
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔐 Double sécurité
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission de relancer un giveaway.",
        ephemeral: true,
      });
    }

    const messageId = interaction.options.getString("id");

    // Chercher le giveaway
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

      // --- Pondération boosters ---
      const boosterRoleId = "1231705711885553665";
      let weightedPool = [];

      for (const [, user] of users) {
        weightedPool.push(user); // chance de base
        const member = await channel.guild.members.fetch(user.id).catch(() => null);
        if (member && member.roles.cache.has(boosterRoleId)) {
          weightedPool.push(user); // +1 chance si booster
        }
      }

      if (!weightedPool.length) {
        return interaction.reply({ content: "❌ Aucun participant valide trouvé.", ephemeral: true });
      }

      // Tirage au sort
      const winner = weightedPool[Math.floor(Math.random() * weightedPool.length)];

      const rerollEmbed = new EmbedBuilder()
        .setTitle("🎉 REROLL 🎉")
        .setDescription(`Félicitations ${winner.toString()} ! Tu as été tiré au sort pour **${giveaway.prize}** 🎁`)
        .addFields({ name: "Avantage Boosters", value: "🚀 Les boosters du serveur ont **x2 chances** de gagner !" })
        .setColor("Orange")
        .setFooter({ text: `Reroll effectué le ${new Date().toLocaleString()}` });

      await channel.send({
        embeds: [rerollEmbed],
        content: `${winner}`, // ping direct
        allowedMentions: { users: [winner.id] }
      });

      return interaction.reply({ content: `✅ Nouveau gagnant tiré : ${winner.toString()}`, ephemeral: true });
    } catch (err) {
      console.error("Erreur reroll:", err);
      return interaction.reply({ content: "❌ Une erreur est survenue lors du reroll.", ephemeral: true });
    }
  },
};
