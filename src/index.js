require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
require("./server.js"); // Pour forcer Render à garder le service actif

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    mongoose.set('strictQuery', false);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connecté à MongoDB.');
    eventHandler(client);
  } catch (error) {
    console.log(`❌ Erreur MongoDB: ${error.message}`);
  }
})();

client.login(process.env.TOKEN);

// 🔥 Rotation des statuts
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const statuses = [
    { name: "👑 protéger le serveur", type: 0 },   // Playing
    { name: "📜 les règles", type: 2 },            // Listening
    { name: "⚔️ bannir les méchants", type: 3 },   // Watching
    { name: "💬 avec la communauté", type: 0 }     // Playing
  ];

  let i = 0;

  setInterval(() => {
    client.user.setPresence({
      activities: [statuses[i]],
      status: "online"
    });

    i = (i + 1) % statuses.length; // boucle infinie
  }, 60_000); // ⏳ toutes les 1 minute
});
