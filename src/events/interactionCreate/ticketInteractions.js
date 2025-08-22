const { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionFlagsBits, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle 
} = require("discord.js");

module.exports = async function ticketInteractions(interaction, client) {
  try {
    // 🔹 Boutons
    if (interaction.isButton()) {
      // Bouton "envoyer l'embed ticket" → ouvre le modal
      if (interaction.customId === "ticketEmbedButton") {
        const modal = new ModalBuilder()
          .setCustomId(`ticketEmbedModal_${interaction.channel.id}`)
          .setTitle("Configurer l'embed des tickets")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed_title")
                .setLabel("Titre")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed_description")
                .setLabel("Description")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed_color")
                .setLabel("Couleur (ex: #00ffcc)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed_image")
                .setLabel("Image (URL)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            )
          );

        return interaction.showModal(modal);
      }

      // Bouton "ouvrir un ticket"
      if (interaction.customId === "ticket_create_button") {
        const existingChannel = interaction.guild.channels.cache.find(
          ch => ch.name === `ticket-${interaction.user.username}`
        );
        if (existingChannel) {
          return interaction.reply({ 
            content: `⚠️ Tu as déjà un ticket ouvert : ${existingChannel}`, 
            ephemeral: true 
          });
        }

        const channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          ],
        });

        // Embed d’accueil dans le ticket
        const ticketEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("📩 Merci d’avoir ouvert un ticket")
          .setDescription("Un modérateur viendra t’aider au plus vite.\n\n⚠️ Merci de **ne pas ping inutilement** le staff.");

        // Boutons de gestion
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_claim")
            .setLabel("Claim")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("Close")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("ticket_close_reason")
            .setLabel("Close With Reason")
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${interaction.user}`, embeds: [ticketEmbed], components: [buttons] });

        return interaction.reply({ content: `✅ Votre ticket a été ouvert : ${channel}`, ephemeral: true });
      }

      // Bouton Claim
      if (interaction.customId === "ticket_claim") {
        const message = await interaction.message.fetch();

        // Supprimer uniquement le bouton Claim
        const newComponents = message.components.map(row => {
          return new ActionRowBuilder().addComponents(
            row.components.filter(btn => btn.data.custom_id !== "ticket_claim")
          );
        });

        await message.edit({ components: newComponents });

        return interaction.reply({ content: `✅ Ce ticket a été claim par ${interaction.user}`, ephemeral: false });
      }

      // Bouton Close
      if (interaction.customId === "ticket_close") {
        await interaction.reply({ content: "✅ Ticket fermé.", ephemeral: true });
        return interaction.channel.delete().catch(err => console.error("❌ Erreur lors de la fermeture :", err));
      }

      // Bouton Close With Reason → ouvre un modal
      if (interaction.customId === "ticket_close_reason") {
        const modal = new ModalBuilder()
          .setCustomId("ticket_reason_modal")
          .setTitle("Fermer le ticket avec une raison")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("ticket_reason_input")
                .setLabel("Raison de la fermeture")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );

        return interaction.showModal(modal);
      }
    }

    // 🔹 Modals
    if (interaction.isModalSubmit()) {
      // Modal embed
      if (interaction.customId.startsWith("ticketEmbedModal_")) {
        const salonId = interaction.customId.split("_")[1];
        const salon = interaction.guild.channels.cache.get(salonId);

        const titre = interaction.fields.getTextInputValue("embed_title");
        const description = interaction.fields.getTextInputValue("embed_description");
        let couleur = interaction.fields.getTextInputValue("embed_color") || "#2f3136";
        const image = interaction.fields.getTextInputValue("embed_image");

        if (!/^#([0-9A-F]{3}){1,2}$/i.test(couleur)) couleur = "#2f3136";

        const embed = new EmbedBuilder()
          .setTitle(titre)
          .setDescription(description)
          .setColor(couleur);

        if (image) embed.setImage(image);

        const bouton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_create_button")
            .setLabel("📩 Ouvrir un ticket")
            .setStyle(ButtonStyle.Primary)
        );

        await salon.send({ embeds: [embed], components: [bouton] });

        return interaction.reply({ content: `✅ L’embed a bien été envoyé dans ${salon}`, ephemeral: true });
      }

      // Modal "raison du ticket"
      if (interaction.customId === "ticket_reason_modal") {
        const reason = interaction.fields.getTextInputValue("ticket_reason_input");

        await interaction.reply({ content: `📌 Ticket fermé par ${interaction.user}.\n**Raison :** ${reason}` });

        setTimeout(() => {
          interaction.channel.delete().catch(err => console.error("❌ Erreur lors de la suppression du ticket :", err));
        }, 3000);

        return;
      }
    }
  } catch (err) {
    console.error("❌ Erreur dans ticketInteractions :", err);
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: "⚠️ Une erreur est survenue.", ephemeral: true });
    } else {
      return interaction.reply({ content: "⚠️ Une erreur est survenue.", ephemeral: true });
    }
  }
};
