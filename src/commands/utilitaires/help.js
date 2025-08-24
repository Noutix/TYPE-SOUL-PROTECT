// src/commands/utilitaires/help.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const getLocalCommands = require("../../utils/getLocalCommands");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Affiche la liste des commandes du bot"),

  async execute(interaction) {
    const allCommands = getLocalCommands();

    // 🔒 Vérifie si l'utilisateur est Admin/Fondateur
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    // ✅ Filtrer les commandes selon le statut
    const visibleCommands = allCommands.filter((cmd) => {
      // Si Admin → il voit tout
      if (isAdmin) return true;
      // Sinon → seulement les commandes sans "permissionsRequired"
      return !cmd.permissionsRequired || cmd.permissionsRequired.length === 0;
    });

    // Associer un emoji par catégorie
    const categoryEmojis = {
      moderation: "⚔️",
      admin: "🔒",
      fun: "🎉",
      utilitaires: "🛠️",
      musique: "🎵",
      ticket: "🎫",
      general: "📌",
    };

    // Grouper par catégorie (nom du dossier parent)
    const categories = {};
    for (const cmd of visibleCommands) {
      const category = path.basename(path.dirname(cmd.filePath)).toLowerCase();
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd);
    }

    // Construire les embeds par catégorie
    const embeds = [];
    const sortedCategories = Object.keys(categories);

    for (const category of sortedCategories) {
      const commands = categories[category];

      let desc = "";
      for (const cmd of commands) {
        const usage = cmd.options?.length
          ? cmd.options.map((o) => `<${o.name}>`).join(" ")
          : "";

        desc += `\`/${cmd.name} ${usage}\`\n${cmd.description}\n\n`;
      }

      const emoji = categoryEmojis[category] || "📂";

      const embed = new EmbedBuilder()
        .setTitle(`${emoji} Commandes de ${category.charAt(0).toUpperCase() + category.slice(1)}`)
        .setDescription(desc || "Aucune commande trouvée")
        .setColor("Blurple")
        .setFooter({ text: `Page ${embeds.length + 1}` });

      embeds.push(embed);
    }

    // Boutons pagination
    let page = 0;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary)
    );

    const message = await interaction.reply({
      embeds: [embeds[page]],
      components: embeds.length > 1 ? [row] : [], // pas de boutons si 1 seule page
      fetchReply: true,
    });

    // Collector pour gérer la navigation
    if (embeds.length > 1) {
      const collector = message.createMessageComponentCollector({
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id)
          return i.reply({ content: "❌ Tu ne peux pas utiliser ces boutons.", ephemeral: true });

        if (i.customId === "prev") page = page > 0 ? --page : embeds.length - 1;
        else if (i.customId === "next") page = page + 1 < embeds.length ? ++page : 0;

        await i.update({
          embeds: [embeds[page].setFooter({ text: `Page ${page + 1}/${embeds.length}` })],
          components: [row],
        });
      });

      collector.on("end", async () => {
        await message.edit({ components: [] }).catch(() => {});
      });
    }
  },
};
