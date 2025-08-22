// handlers/ticketReasonHandler.js
const { 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType,
  InteractionType // 🔹 AJOUT
} = require("discord.js");

module.exports = async function ticketReasonHandler(interaction, client) {
  try {
    // 🔹 Fix pour v14 : plus de .isModalSubmit()
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId !== "ticket_reason_modal") return;

    const raison = interaction.fields.getTextInputValue("ticket_reason_input");

    // ✅ Récupérer la config stockée
    const config = await client.db.TicketConfig.findOne({ guildId: interaction.guild.id });
    console.log("🔎 Config tickets récupérée :", config); // <-- LOG

    if (!config) {
      return interaction.reply({
        content: "⚠️ La configuration des tickets n’est pas définie.",
        ephemeral: true,
      });
    }

    const category = interaction.guild.channels.cache.get(config.categoryId);
    console.log("📂 Catégorie trouvée :", category?.name || "Introuvable"); // <-- LOG

    if (!category) {
      return interaction.reply({
        content: "⚠️ La catégorie définie pour les tickets est introuvable.",
        ephemeral: true,
      });
    }

    // ✅ Permissions
    const overwrites = [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ];

    if (config.supportRole1) {
      console.log("👥 Support Role 1 :", config.supportRole1);
      overwrites.push({
        id: config.supportRole1,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      });
    }
    if (config.supportRole2) {
      console.log("👥 Support Role 2 :", config.supportRole2);
      overwrites.push({
        id: config.supportRole2,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      });
    }
    if (config.supportRole3) {
      console.log("👥 Support Role 3 :", config.supportRole3);
      overwrites.push({
        id: config.supportRole3,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      });
    }

    // ✅ Créer le salon
    console.log("🚀 Création du salon avec overwrites :", overwrites);
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category.id, // 🔹 en v14 la bonne clé est `parent`
      permissionOverwrites: overwrites,
    });

    // ✅ Confirmer à l’utilisateur
    await interaction.reply({
      content: `✅ Votre ticket a été créé : ${channel}`,
      ephemeral: true,
    });

    // ✅ Embed principal
    const mainEmbed = new EmbedBuilder()
      .setTitle("🎟️ Merci d'avoir ouvert un ticket")
      .setDescription("Un modérateur viendra t'aider au plus vite.\n\n⚠️ Merci de ne pas ping inutilement le staff.")
      .setColor("Green");

    // ✅ Embed secondaire (raison)
    const reasonEmbed = new EmbedBuilder()
      .setTitle("📌 Raison du ticket")
      .setDescription(raison)
      .setColor("Red");

    // ✅ Boutons
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Close")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("ticket_close_reason")
        .setLabel("Close With Reason")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("ticket_claim")
        .setLabel("Claim")
        .setStyle(ButtonStyle.Success)
    );

    // ✅ Message dans le ticket
    await channel.send({
      embeds: [mainEmbed, reasonEmbed],
      components: [buttons],
    });

  } catch (err) {
    console.error("❌ Erreur ticketReasonHandler:", err);
    return interaction.reply({
      content: "❌ Une erreur est survenue lors de la création du ticket.",
      ephemeral: true,
    });
  }
};
