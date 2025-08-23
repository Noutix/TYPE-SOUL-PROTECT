module.exports = (client) => {
    console.log(`${client.user.tag} est en ligne.`);

    // Appelle directement le fichier runner
    require("../../commands/giveaways/runner.js")(client);
};
