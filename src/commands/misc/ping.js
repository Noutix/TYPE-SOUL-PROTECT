module.exports = {
    name: 'ping',
    description: 'pong',
    //devOnly: Boolean,
    //testOnly: Boolean,
    //Options: Object[],
    //Deleted: Boolean,

    callback: (client, interaction) => {
        interaction.reply(`Pong! ${client.ws.ping}ms`)
    },
};