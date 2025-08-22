const { SlashCommandBuilder } = require("discord.js");
const Sanction = require("../../models/Sanction.js");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear-sanctions")
    .setDescription("Supprimer toutes les sanctions d’un membre")
    .addUserOption(option => option.setName("membre").setDescription("Membre ciblé").setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser("membre");

    const result = await Sanction.deleteMany({ userId: target.id, guildId: interaction.guild.id });

    if (result.deletedCount === 0) {
      return interaction.reply(`❌ ${target.tag} n’avait aucune sanction.`);
    }

    interaction.reply(`✅ Toutes les sanctions de ${target.tag} ont été supprimées (${result.deletedCount}).`);
  }
};
