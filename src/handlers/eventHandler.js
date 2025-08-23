const path = require('path');
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b);

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    // 🔥 On supprime les anciens listeners avant d’en rajouter
    client.removeAllListeners(eventName);

    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);

        try {
          if (typeof eventFunction === "function") {
            await eventFunction(...args, client);
          } else if (typeof eventFunction.execute === "function") {
            await eventFunction.execute(...args, client);
          } else {
            console.log(`⚠️ Mauvais export dans ${eventFile}`);
          }
        } catch (error) {
          console.error(`❌ Erreur dans l’event ${eventName} (${eventFile}) :`, error);
        }
      }
    });
  }
};
