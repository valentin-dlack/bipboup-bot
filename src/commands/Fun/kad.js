const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kad')
        .setDescription(`Ahahah kaded`),
        permissions: [],
    category: "Fun",

    async execute(interaction) {
        let channel = interaction.channel
        interaction.reply({ content: 'Kad envoyé !', ephemeral: true })
        channel.send('https://i.imgur.com/T64y7xg.png')
    }
}