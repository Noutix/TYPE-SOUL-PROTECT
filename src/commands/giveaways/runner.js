const Giveaway = require('../../models/Giveaway');
const { EmbedBuilder } = require("discord.js");

module.exports = async (client) => {
  console.log("✅ Giveaway runner lancé...");

  setInterval(async () => {
    try {
      const giveaways = await Giveaway.find({ ended: false });

      for (const giveaway of giveaways) {
        if (Date.now() >= giveaway.endAt) {
          try {
            const channel = await client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            const reaction = message.reactions.cache.get("🎉");
            const users = (await reaction?.users.fetch())?.filter(u => !u.bot);

            let winners = [];
            if (users && users.size > 0) {
              winners = users.random(giveaway.winnersCount);
              if (!Array.isArray(winners)) winners = [winners]; // sécurité si 1 gagnant
            }

            // Embed final (modification du message original)
            const embed = new EmbedBuilder()
              .setTitle("🎉 GIVEAWAY TERMINÉ 🎉")
              .setDescription(`**${giveaway.prize}**`)
              .addFields({
                name: "Gagnant(s)",
                value: winners.length > 0 ? winners.map(w => w.toString()).join(", ") : "Aucun gagnant",
                inline: false
              })
              .setColor("Red")
              .setFooter({ text: `Terminé à` })
              .setTimestamp(new Date());

            await message.edit({ embeds: [embed] });

            // Message de félicitations séparé
            if (winners.length > 0) {
              await channel.send(
                `🎉 Félicitations ${winners.map(w => w.toString()).join(", ")} ! Tu as gagné **${giveaway.prize}** !`
              );
            } else {
              await channel.send(`❌ Aucun gagnant n'a pu être tiré pour **${giveaway.prize}**.`);
            }

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
