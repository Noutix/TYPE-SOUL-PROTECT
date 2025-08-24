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
                let weightedPool = [];

                const boosterRoleId = "1231705711885553665";

                if (participants.size === 0) {
                    await channel.send("⚠️ Personne n’a participé au giveaway...");
                } else {
                    // Construire le pool pondéré
                    for (const [, user] of participants) {
                        weightedPool.push(user); // 1 chance de base

                        const member = await channel.guild.members.fetch(user.id).catch(() => null);
                        if (member && member.roles.cache.has(boosterRoleId)) {
                            weightedPool.push(user); // chance supplémentaire si booster
                        }
                    }

                    // Tirer au sort les gagnants
                    for (let i = 0; i < giveaway.winnersCount; i++) {
                        if (weightedPool.length === 0) break;
                        const winner = weightedPool[Math.floor(Math.random() * weightedPool.length)];
                        winners.push(winner);

                        // Retirer toutes les occurrences de ce gagnant du pool (pour éviter doublons)
                        weightedPool = weightedPool.filter(u => u.id !== winner.id);
                    }
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
                        { name: "Terminé à", value: `<t:${Math.floor(Date.now() / 1000)}:f>` },
                        { name: "Avantage Boosters", value: "🚀 Les boosters du serveur avaient **x2 chances** de gagner !" }
                    )
                    .setColor("Red");

                // Met à jour le message du giveaway
                await message.edit({ embeds: [endEmbed], content: null });

                // Envoie un message de félicitations si gagnants
                if (winners.length > 0) {
                    await channel.send(
                        `🎉 Félicitations ${winners.map(w => `${w}`).join(", ")} ! Vous avez gagné **${giveaway.prize}** 🎁`
                    );
                }

            } catch (err) {
                console.error("Erreur dans le runner de giveaway :", err);
            }
        }
    }, 10000); // toutes les 10 secondes
};
