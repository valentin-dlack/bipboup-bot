const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageEmbed
} = require('discord.js')
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription(`setup !!! woohoo`)
        .addChannelOption(option => option.setName('channel-logs').setDescription("Enter the logs channel")),

    async execute(interaction) {
        let channel = interaction.options.getChannel('channel-logs');

        interaction.reply({
            content: "Wohoo !"
        })
    }
}