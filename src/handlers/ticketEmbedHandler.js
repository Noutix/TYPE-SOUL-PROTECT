const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function ticketEmbedHandler(interaction, client) {
  if (!interaction.isModalSubmit()) return;

  // Vérifie si c'est bien le modal du ticket embed
  if (interaction.customId.startsWith("ticketEmbedModal_")) {
    try {
      const salonId = interaction.customId.split("_")[1];
      const salon = interaction.guild.channels.cache.get(salonId);

      if (!salon) {
        return interaction.reply({
          content: "⚠️ Le salon configuré est introuvable.",
          ephemeral: true
        });
      }

      const titre = interaction.fields.getTextInputValue("embed_title");
      const description = interaction.fields.getTextInputValue("embed_description");

      // ✅ Sécuriser la couleur
      let couleur = interaction.fields.getTextInputValue("embed_color");
      if (!/^#([0-9A-F]{3}){1,2}$/i.test(couleur)) {
        couleur = "#2f3136"; // défaut
      }

      const image = interaction.fields.getTextInputValue("embed_image");

      const embed = new EmbedBuilder()
        .setTitle(titre)
        .setDescription(description)
        .setColor(couleur);

      if (image) embed.setImage(image);

      // Bouton pour ouvrir un ticket
      const bouton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_create_button")
          .setLabel("📩 Ouvrir un ticket")
          .setStyle(ButtonStyle.Primary)
      );

      // Envoie dans le salon choisi
      await salon.send({ embeds: [embed], components: [bouton] });

      // Confirmer à l’utilisateur
      await interaction.reply({
        content: `✅ L’embed des tickets a bien été envoyé dans ${salon}`,
        ephemeral: true
      });
    } catch (err) {
      console.error("❌ Erreur ticketEmbedHandler :", err);

      if (!interaction.replied) {
        await interaction.reply({
          content: "⚠️ Une erreur est survenue lors de l’envoi de l’embed.",
          ephemeral: true
        });
      }
    }
  }
};
