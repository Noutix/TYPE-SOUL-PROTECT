require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

// Fonction récursive pour lister tous les fichiers
function getCommandFiles(dirPath) {
    let results = [];
    const list = fs.readdirSync(dirPath);

    list.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(getCommandFiles(filePath));
        } else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });

    return results;
}

// Récupère tous les fichiers de commandes
const commandFiles = getCommandFiles(path.join(__dirname, 'commands'));

for (const file of commandFiles) {
    const command = require(file);

    if (command.data && command.data.name) {
        // ✅ Format SlashCommandBuilder
        commands.push(command.data.toJSON());
    } else if (command.name && command.description) {
        // ✅ Ancien format { name, description }
        commands.push({
            name: command.name,
            description: command.description,
            options: command.options || []
        });
    } else {
        console.log(`⚠️ Commande invalide ignorée : ${file}`);
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ Enregistrement des slash commandes...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Les slash commandes ont été mises à jour avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l’enregistrement des commandes :', error);
    }
})();
    