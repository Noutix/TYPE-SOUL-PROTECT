const Giveaway = require('../../models/Giveaway');
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  console.log("✅ Giveaway runner lancé...");

  // Vérifie toutes les 60 secondes
  setInterval(async () => {
    try {
      const giveaways = await Giveaway.find({ ended: false });

      for (const giveaway of giveaways) {
        if (Date.now() >= giveaway.endAt) {
          try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            // Récupère les utilisateurs ayant réagi 🎉
            const reaction = message.reactions.cache.get("🎉");
            const users = (await reaction?.users.fetch())?.filter(u => !u.bot);

            let winners = [];
            if (users && users.size > 0) {
              winners = users.random(giveaway.winners);
            }

            // Embed des résultats
            const embed = new EmbedBuilder()
              .setTitle("🎉 GIVEAWAY TERMINÉ 🎉")
              .setDescription(
                winners.length > 0
                  ? `Félicitations à ${winners.map(w => w.toString()).join(", ")} ! Vous avez gagné **${giveaway.prize}**`
                  : `❌ Aucun gagnant n'a pu être tiré pour **${giveaway.prize}**.`
              )
              .setColor("Red");

            await channel.send({ embeds: [embed] });

            giveaway.ended = true;
            await giveaway.save();

          } catch (err) {
            console.error(`❌ Erreur lors de la finalisation du giveaway ${giveaway._id}:`, err);
          }
        }
      }
    } catch (error) {
      console.error("❌ Erreur dans le runner giveaway :", error);
    }
  }, 60 * 1000); // toutes les 60 sec
};
