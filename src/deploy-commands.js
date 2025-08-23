    require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

// On charge toutes les commandes
const commands = [];
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./src/commands/${file}`);
    if (command.data) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ Déploiement des commandes sur le serveur...');
        
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('✅ Commandes enregistrées sur ton serveur unique.');
    } catch (error) {
        console.error(error);
    }
})();
