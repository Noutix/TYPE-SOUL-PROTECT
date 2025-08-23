module.exports = (client) => {
    console.log(`${client.user.tag} est en ligne.`);

    // Lancer le runner des giveaways
    require("../../commands/giveaways/runner.js")(client);
    runner(client);
};
