// src/commands/Tickets/ticket-embed.js
const { 
  SlashCommandBuilder, 
  ChannelType, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  PermissionFlagsBits 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-embed") // ✅ nom unique
    .setDescription("Configurer et envoyer l’embed de tickets")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 Réservé aux admins
    .addChannelOption(opt =>
      opt.setName("salon")
        .setDescription("Le salon où envoyer l’embed")
        .addChannelTypes([ChannelType.GuildText])
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔐 Double sécurité
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission d’utiliser cette commande.",
        ephemeral: true,
      });
    }

    const salon = interaction.options.getChannel("salon");

    // Création du modal
    const modal = new ModalBuilder()
      .setCustomId(`ticketEmbedModal_${salon.id}`)
      .setTitle("📩 Configuration de l’embed tickets");

    // Champs du formulaire
    const titre = new TextInputBuilder()
      .setCustomId("embed_title")
      .setLabel("Titre")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: Ouvrir un ticket")
      .setRequired(true);

    const description = new TextInputBuilder()
      .setCustomId("embed_description")
      .setLabel("Description")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Ex: Veuillez décrire votre problème.")
      .setRequired(true);

    const couleur = new TextInputBuilder()
      .setCustomId("embed_color")
      .setLabel("Couleur (optionnelle)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("#00ffcc")
      .setRequired(false);

    const image = new TextInputBuilder()
      .setCustomId("embed_image")
      .setLabel("URL de l’image (optionnelle)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://example.com/image.png")
      .setRequired(false);

    // Organisation en ActionRows
    const rows = [
      new ActionRowBuilder().addComponents(titre),
      new ActionRowBuilder().addComponents(description),
      new ActionRowBuilder().addComponents(couleur),
      new ActionRowBuilder().addComponents(image),
    ];

    modal.addComponents(rows);

    // Ouvrir le modal
    await interaction.showModal(modal);
  }
};
