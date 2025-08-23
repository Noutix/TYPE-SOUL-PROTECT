require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        // Supprimer globales
        console.log('⏳ Suppression des commandes globales...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('✅ Toutes les commandes globales ont été supprimées.');

        // Supprimer guild (pour ton serveur de dev par ex.)
        console.log('⏳ Suppression des commandes guild...');
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID // ajoute ton ID serveur dans .env
            ),
            { body: [] }
        );
        console.log('✅ Toutes les commandes guild ont été supprimées.');
    } catch (error) {
        console.error(error);
    }
})();
