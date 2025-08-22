const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (interaction, client) => {
  // ⚡ Vérifier si c'est bien une commande slash
  if (!interaction.isChatInputCommand?.()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.data?.name === interaction.commandName || cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    // Dev only
    if (commandObject.devOnly && !devs.includes(interaction.member.id)) {
      return interaction.reply({
        content: '🚫 Seulement les développeurs peuvent utiliser cette commande.',
        ephemeral: true,
      });
    }

    // Test server only
    if (commandObject.testOnly && interaction.guild.id !== testServer) {
      return interaction.reply({
        content: '🚫 Cette commande ne peut pas être exécutée ici.',
        ephemeral: true,
      });
    }

    // Permissions user
    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          return interaction.reply({
            content: '🚫 Tu n’as pas les permissions nécessaires.',
            ephemeral: true,
          });
        }
      }
    }

    // Permissions bot
    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;
        if (!bot.permissions.has(permission)) {
          return interaction.reply({
            content: '🚫 Je n’ai pas les permissions nécessaires.',
            ephemeral: true,
          });
        }
      }
    }

    // ✅ Exécution de la commande avec interaction + client
    if (typeof commandObject.callback === "function") {
      await commandObject.callback(interaction, client);
    } else if (typeof commandObject.execute === "function") {
      await commandObject.execute(interaction, client);
    } else {
      console.log(`❌ La commande ${commandObject.data?.name || commandObject.name} n'a ni callback ni execute`);
    }

  } catch (error) {
    console.log(`❌ Erreur lors de l’exécution de la commande:`, error);
  }
};
