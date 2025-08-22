const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Sanction = require("../../models/Sanction.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Avertir un membre")
        .addUserOption(option =>
            option.setName("membre").setDescription("Le membre à avertir").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("raison").setDescription("Raison du warn").setRequired(false)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "❌ Tu n’as pas la permission.", ephemeral: true });
        }

        const target = interaction.options.getUser("membre");
        const reason = interaction.options.getString("raison") || "Aucune raison spécifiée.";

        // --- Enregistrement en base de données
        await Sanction.create({
            userId: target.id,
            guildId: interaction.guild.id,
            moderatorId: interaction.user.id,
            type: "warn",
            reason,
            date: new Date()
        });

        // --- Embed DM envoyé au membre
        const dmEmbed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("⚠️ Avertissement reçu")
            .setDescription(`Vous avez reçu un avertissement sur **${interaction.guild.name}**.`)
            .addFields(
                { name: "👮 Modérateur", value: `${interaction.user.tag}`, inline: true },
                { name: "📄 Raison", value: reason, inline: true }
            )
            .setTimestamp();

        try {
            await target.send({ embeds: [dmEmbed] });
        } catch (e) {
            console.log(`❌ Impossible d’envoyer un DM à ${target.tag}`);
        }

        // --- Confirmation dans le salon
        const publicEmbed = new EmbedBuilder()
            .setColor("Orange")
            .setDescription(`✅ ${target.tag} a été averti.`)
            .addFields({ name: "Raison", value: reason });

        await interaction.reply({ embeds: [publicEmbed] });
    }
};
