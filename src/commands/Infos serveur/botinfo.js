const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Affiche les infos sur le bot."),

  async execute(interaction) {
    const { client } = interaction;

    // Uptime en format lisible
    const totalSeconds = Math.floor(client.uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const uptime = `${days}j ${hours}h ${minutes}m ${seconds}s`;

    // Embed
    const embed = new EmbedBuilder()
      .setTitle("🤖 Infos sur le bot")
      .setColor("Blue")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: "👤 Nom", value: client.user.tag, inline: true },
        { name: "🆔 ID", value: client.user.id, inline: true },
        { name: "📅 Créé le", value: `<t:${parseInt(client.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "🚀 En ligne depuis", value: uptime, inline: true },
        { name: "📡 Latence", value: `${client.ws.ping}ms`, inline: true },
        { name: "👥 Utilisateurs", value: `${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)}`, inline: true },
        { name: "🛡️ Serveurs", value: `${client.guilds.cache.size}`, inline: true },
        { name: "💻 Hébergé sur", value: `${os.platform()} (${os.arch()})`, inline: true }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
