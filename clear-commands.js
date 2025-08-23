require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ Suppression des commandes globales...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] } // vide = supprime toutes les globales
        );
        console.log('✅ Toutes les commandes globales ont été supprimées.');
    } catch (error) {
        console.error(error);
    }
})();
