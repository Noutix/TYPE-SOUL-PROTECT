const { EmbedBuilder } = require("discord.js");
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

                let winners = [];
                if (participants.size === 0) {
                    await channel.send("⚠️ Personne n’a participé au giveaway...");
                } else {
                    // Tire les gagnants
                    winners = participants.random(giveaway.winnersCount);
                    if (!Array.isArray(winners)) winners = [winners]; // si 1 seul gagnant
                }

                // Marque comme terminé
                giveaway.ended = true;
                await giveaway.save();

                // === Embed final ===
                const endEmbed = new EmbedBuilder()
                    .setTitle("🎉 GIVEAWAY TERMINÉ 🎉")
                    .setDescription(`${giveaway.prize}`)
                    .addFields(
                        { name: "Gagnant(s)", value: winners.length > 0 ? winners.map(w => `${w}`).join(", ") : "Aucun" },
                        { name: "Terminé à", value: `<t:${Math.floor(Date.now() / 1000)}:f>` }
                    )
                    .setColor("Red");

                // Met à jour le message du giveaway
                await message.edit({ embeds: [endEmbed], content: null });

                // Envoie un message de félicitations si gagnants
                if (winners.length > 0) {
                    await channel.send(
                        `🎉 Félicitations ${winners.map(w => `${w}`).join(", ")} ! Tu as gagné **${giveaway.prize}** 🎁`
                    );
                }

            } catch (err) {
                console.error("Erreur dans le runner de giveaway :", err);
            }
        }
    }, 10000); // toutes les 10 secondes
};
