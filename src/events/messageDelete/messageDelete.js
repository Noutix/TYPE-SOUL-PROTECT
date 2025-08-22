const { snipes } = require("../../commands/utilitaires/snipe.js");

module.exports = async (message, client) => {
  if (!message.guild || !message.author || message.author.bot) return;

  snipes.set(message.channel.id, {
    content: message.content,
    author: message.author,
    date: new Date(),
  });

  console.log(`[SNIPE] Message supprimé dans #${message.channel.name} : ${message.content}`);
};
