require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');
require("./server.js");

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
