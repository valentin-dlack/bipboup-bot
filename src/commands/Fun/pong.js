const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pong')
        .setDescription(`Pong...`),
        permissions: [],
        category: "Fun",

    async execute(interaction) {
        interaction.reply(`Pong...`);   
    }
}