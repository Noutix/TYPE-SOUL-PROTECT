const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Sanction = require("../../models/Sanction.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sanction-lister")
        .setDescription("Voir les sanctions d’un membre")
        .addUserOption(option =>
            option.setName("membre").setDescription("Le membre ciblé").setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("membre");

        const sanctions = await Sanction.find({
            userId: target.id,
            guildId: interaction.guild.id
        });

        if (!sanctions || sanctions.length === 0) {
            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("📋 Sanctions")
                    .setDescription(`❌ ${target.tag} n’a aucune sanction.`)],
                ephemeral: true
            });
        }

        let page = 0;
        const sanctionsPerPage = 5;
        const totalPages = Math.ceil(sanctions.length / sanctionsPerPage);

        const generateEmbed = (page) => {
            const start = page * sanctionsPerPage;
            const current = sanctions.slice(start, start + sanctionsPerPage);

            const embed = new EmbedBuilder()
                .setColor("Orange")
                .setTitle(`📋 Historique de ${target.tag} | Page ${page + 1}/${totalPages}`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            current.forEach((s, i) => {
                embed.addFields({
                    name: `${s.type.toUpperCase()} • ${s.date.toLocaleDateString()}`,
                    value: `**Modérateur :** <@${s.moderatorId}>\n**Raison :** ${s.reason || "Aucune"}`
                });
            });

            return embed;
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️ Précédent")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("➡️ Suivant")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages - 1)
            );

        const message = await interaction.reply({
            embeds: [generateEmbed(page)],
            components: [row],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            time: 60000
        });

        collector.on("collect", async (btn) => {
            if (btn.user.id !== interaction.user.id) {
                return btn.reply({ content: "❌ Tu ne peux pas utiliser ces boutons.", ephemeral: true });
            }

            if (btn.customId === "prev" && page > 0) page--;
            else if (btn.customId === "next" && page < totalPages - 1) page++;

            await btn.update({
                embeds: [generateEmbed(page)],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("⬅️ Précédent")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("➡️ Suivant")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === totalPages - 1)
                )]
            });
        });

        collector.on("end", () => {
            message.edit({ components: [] }).catch(() => {});
        });
    }
};
