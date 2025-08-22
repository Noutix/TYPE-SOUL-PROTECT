// src/events/ready/01registerCommands.js
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands({
      // tu peux ajouter d’autres exclusions ici si besoin
      exclude: []
    });

    console.log(`🔎 Commandes prêtes à enregistrer:`,
      localCommands.map(c => c.name).join(', ') || '(aucune)');

    // Enregistre au niveau du serveur (guild) -> plus rapide
    await client.application.commands.set(localCommands, process.env.GUILD_ID);

    console.log(`✅ ${localCommands.length} commande(s) synchronisée(s) sur la guilde.`);
  } catch (error) {
    console.error('❌ Erreur lors de la synchro des commandes:');
    // Affiche l’erreur détaillée pour repérer le champ fautif
    console.dir(error.rawError ?? error, { depth: 4 });
  }
};
