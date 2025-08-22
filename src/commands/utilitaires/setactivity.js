// src/commands/utilitaires/setactivity.js
const { SlashCommandBuilder, ActivityType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setactivity")
    .setDescription("Changer l'activité du bot (réservé au propriétaire du bot)")
    .addStringOption(option =>
      option
        .setName("type")
        .setDescription("Type d'activité")
        .setRequired(true)
        .addChoices(
          { name: "Joue à", value: "PLAYING" },
          { name: "Regarde", value: "WATCHING" },
          { name: "Écoute", value: "LISTENING" },
          { name: "Diffuse", value: "STREAMING" }
        )
    )
    .addStringOption(option =>
      option
        .setName("texte")
        .setDescription("Texte de l'activité")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const ownerId = "864104116087554068"; // ton ID Discord

    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "❌ Tu n’as pas la permission d’utiliser cette commande.",
        ephemeral: true
      });
    }

    const type = interaction.options.getString("type");
    const texte = interaction.options.getString("texte");

    try {
      if (type === "STREAMING") {
        client.user.setPresence({
          activities: [{
            name: texte,
            type: ActivityType.Streaming,
            url: "https://twitch.tv/noutixtv" // tu peux changer ton lien ici
          }],
          status: "online"
        });
      } else {
        client.user.setPresence({
          activities: [{
            name: texte,
            type: ActivityType[type] // Mapping propre via discord.js
          }],
          status: "online"
        });
      }

      await interaction.reply({
        content: `✅ Activité changée en **${type.toLowerCase()} ${texte}**`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Impossible de changer l'activité.",
        ephemeral: true
      });
    }
  }
};
