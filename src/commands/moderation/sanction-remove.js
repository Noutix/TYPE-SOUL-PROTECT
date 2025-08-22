const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Sanction = require("../../models/Sanction.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sanction-remove")
    .setDescription("Supprimer une sanction")
    .addUserOption((option) =>
      option.setName("membre").setDescription("Membre ciblé").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("numéro")
        .setDescription("Numéro de la sanction (voir /sanction-lister)")
        .setRequired(false)
    ),

  // ex: ton handler lit permissionsRequired pour filtrer
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],

  async execute(interaction) {
    const target = interaction.options.getUser("membre");
    const numero = interaction.options.getInteger("numéro");

    const sanctions = await Sanction.find({
      userId: target.id,
      guildId: interaction.guild.id,
    }).sort({ date: -1 });

    if (!sanctions.length) {
      return interaction.reply({
        content: `❌ ${target.tag} n’a aucune sanction.`,
        ephemeral: true,
      });
    }

    // --- Cas 1 : un numéro a été fourni -> suppression directe
    if (numero) {
      if (numero < 1 || numero > sanctions.length) {
        return interaction.reply({
          content: `❌ Numéro invalide. Utilise **/sanction-lister** pour voir les sanctions et leur ordre.`,
          ephemeral: true,
        });
      }
      const sanction = sanctions[numero - 1];
      await Sanction.deleteOne({ _id: sanction._id });
      return interaction.reply({
        content: `✅ Sanction **n°${numero}** de **${target.tag}** supprimée (${sanction.type} – ${sanction.reason || "Aucune raison"}).`,
        ephemeral: true,
      });
    }

    // --- Cas 2 : une seule sanction -> confirmation par boutons
    if (sanctions.length === 1) {
      const sanction = sanctions[0];

      const embed = new EmbedBuilder()
        .setTitle("⚠️ Supprimer cette sanction ?")
        .setColor("Orange")
        .setDescription(`${target.tag} n’a qu’une seule sanction.\nVoulez-vous la supprimer ?`)
        .addFields(
          { name: "Type", value: sanction.type || "Non spécifié", inline: true },
          { name: "Raison", value: sanction.reason || "Aucune raison", inline: true }
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`remove_yes_${sanction._id}`)
          .setLabel("Oui")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`remove_no_${sanction._id}`)
          .setLabel("Non")
          .setStyle(ButtonStyle.Danger)
      );

      const msg = await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
        fetchReply: true,
      });

      const collector = msg.createMessageComponentCollector({ time: 60_000 });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ Tu ne peux pas utiliser ces boutons.", ephemeral: true });
        }

        if (i.customId === `remove_yes_${sanction._id}`) {
          await Sanction.deleteOne({ _id: sanction._id });
          return i.update({
            content: `✅ Sanction supprimée : **${sanction.type}** – ${sanction.reason || "Aucune raison"}.`,
            embeds: [],
            components: [],
          });
        }

        if (i.customId === `remove_no_${sanction._id}`) {
          return i.update({
            content: "❌ Suppression annulée.",
            embeds: [],
            components: [],
          });
        }
      });

      collector.on("end", () => {
        msg.edit({ components: [] }).catch(() => {});
      });

      return;
    }

    // --- Cas 3 : plusieurs sanctions -> menu déroulant
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`remove_select_${target.id}`)
      .setPlaceholder("Choisissez une sanction à retirer")
      .addOptions(
        sanctions.map((s, i) => ({
          label: `${i + 1}. ${s.type || "Sanction"} - ${(s.reason || "Aucune raison").slice(0, 50)}`,
          description: `ID court: ${s._id.toString().slice(-6)}`,
          value: s._id.toString(),
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const msg = await interaction.reply({
      content: `📋 ${target.tag} a **${sanctions.length} sanctions**.\nSélectionnez celle à retirer :`,
      components: [row],
      ephemeral: true,
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({ time: 60_000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Tu ne peux pas utiliser ce menu.", ephemeral: true });
      }
      if (!i.values?.length) return i.deferUpdate();

      const selectedId = i.values[0];
      const doc = await Sanction.findOne({
        _id: selectedId,
        userId: target.id,
        guildId: interaction.guild.id,
      });

      if (!doc) {
        return i.update({
          content: "❌ Impossible de trouver cette sanction (déjà supprimée ?).",
          components: [],
        });
      }

      await Sanction.deleteOne({ _id: selectedId });
      return i.update({
        content: `✅ Sanction supprimée : **${doc.type}** – ${doc.reason || "Aucune raison"}.`,
        components: [],
      });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  },
};
