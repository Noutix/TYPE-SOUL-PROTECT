// handlers/ticketCreateHandler.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const TicketConfig = require("../models/TicketConfig"); // ✅ import du modèle

module.exports = async function ticketCreateHandler(interaction, client) {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "ticket_create_button") return;

  // 🔹 Récupérer la config des tickets
  const config = await TicketConfig.findOne({ guildId: interaction.guild.id });

  if (!config || !config.categoryId) {
    return interaction.reply({
      content: "⚠️ La configuration des tickets n'est pas définie. Utilise `/ticket-config` pour la définir.",
      ephemeral: true,
    });
  }

  // ✅ Construire le modal
  const modal = new ModalBuilder()
    .setCustomId("ticket_reason_modal")
    .setTitle("Raison du ticket");

  const raisonInput = new TextInputBuilder()
    .setCustomId("ticket_reason_input")
    .setLabel("Quelle est la raison de votre ticket ?")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const row = new ActionRowBuilder().addComponents(raisonInput);
  modal.addComponents(row);

  await interaction.showModal(modal);
};
