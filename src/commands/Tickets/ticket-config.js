const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-config")
    .setDescription("Configurer l’embed de création de tickets.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 réservé Admins
    .addChannelOption(option =>
      option
        .setName("salon")
        .setDescription("Salon où envoyer l’embed de tickets")
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔐 Double sécurité
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission de configurer les tickets.",
        ephemeral: true,
      });
    }

    const salon = interaction.options.getChannel("salon");

    // Création du modal
    const modal = new ModalBuilder()
      .setCustomId(`ticketEmbedModal_${salon.id}`)
      .setTitle("📩 Configuration de l’embed ticket");

    const titre = new TextInputBuilder()
      .setCustomId("embed_title")
      .setLabel("Titre de l’embed")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: Support, Aide, Contact...")
      .setRequired(true);

    const description = new TextInputBuilder()
      .setCustomId("embed_description")
      .setLabel("Description de l’embed")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Expliquez à quoi sert ce ticket")
      .setRequired(true);

    const couleur = new TextInputBuilder()
      .setCustomId("embed_color")
      .setLabel("Couleur (hexadécimal)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("#2f3136")
      .setRequired(false);

    const image = new TextInputBuilder()
      .setCustomId("embed_image")
      .setLabel("Image (URL)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://...")
      .setRequired(false);

    // Organisation des inputs dans des ActionRows
    const row1 = new ActionRowBuilder().addComponents(titre);
    const row2 = new ActionRowBuilder().addComponents(description);
    const row3 = new ActionRowBuilder().addComponents(couleur);
    const row4 = new ActionRowBuilder().addComponents(image);

    modal.addComponents(row1, row2, row3, row4);

    await interaction.showModal(modal);
  }
};
