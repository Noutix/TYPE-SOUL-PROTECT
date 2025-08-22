const path = require('path');
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b);

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        const eventFunction = require(eventFile);

        try {
          if (typeof eventFunction === "function") {
            // Cas 1 : export direct d'une fonction
            await eventFunction(...args, client);
          } else if (typeof eventFunction.execute === "function") {
            // Cas 2 : export sous forme { name, execute }
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
