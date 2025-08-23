const Giveaway = require("../../models/Giveaway");

module.exports = async (client) => {
    console.log("🎉 Giveaway runner lancé...");

    // Vérifie toutes les 10 secondes
    setInterval(async () => {
        const now = Date.now();

        // Récupère les giveaways encore actifs et déjà terminés dans le temps
        const giveaways = await Giveaway.find({
            ended: false,
            endAt: { $lt: now }
        });

        for (const giveaway of giveaways) {
            try {
                const channel = await client.channels.fetch(giveaway.channelId);
                if (!channel) continue;

                const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
                if (!message) continue;

                const reactions = message.reactions.cache.get("🎉");
                if (!reactions) continue;

                const users = await reactions.users.fetch();
                const participants = users.filter(u => !u.bot);

                if (participants.size === 0) {
                    await channel.send("⚠️ Personne n’a participé au giveaway...");
                } else {
                    // Tire les gagnants
                    const winners = participants.random(giveaway.winnersCount);
                    channel.send(`🎉 Félicitations ${winners.map(w => `<@${w.id}>`).join(", ")} ! Vous avez gagné **${giveaway.prize}** 🎁`);
                }

                // Marque comme terminé
                giveaway.ended = true;
                await giveaway.save();

                // Édite le message original
                await message.edit({
                    content: `🎉 **GIVEAWAY TERMINÉ** 🎉\nPrix : **${giveaway.prize}**\nGagnant(s) : ${participants.size > 0 ? participants.map(u => `<@${u.id}>`).join(", ") : "Aucun"}`
                });

            } catch (err) {
                console.error("Erreur dans le runner de giveaway :", err);
            }
        }
    }, 10000); // toutes les 10 secondes
};
