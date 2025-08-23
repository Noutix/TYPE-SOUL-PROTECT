module.exports = (client) => {
    console.log(`${client.user.tag} est en ligne.`);

    // Lancer le runner des giveaways
    const runner = require("../commands/giveaways/runner.js");
    runner(client);
};
