const ticketInteractions = require("../../modules/ticketInteractions.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction) return;

    try {
      // 🔹 Tickets
      await ticketInteractions(interaction, client);

      // 🔹 Slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
      }
    } catch (error) {
      console.error("❌ Erreur dans interactionCreate :", error);

      if (interaction.isRepliable && interaction.isRepliable()) {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({ content: "⚠️ Une erreur est survenue.", ephemeral: true });
        } else {
          await interaction.reply({ content: "⚠️ Une erreur est survenue.", ephemeral: true });
        }
      }
    }
  },
};
