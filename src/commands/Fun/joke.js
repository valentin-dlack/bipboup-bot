const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const botConfig = require('../../../cfg.json');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription(`Envoie une blague totalement random.`),

    async execute(interaction) {
        fetch('https://www.blagues-api.fr/api/random?disallow=dark&disallow=limit', {
                headers: {
                    'Authorization': `Bearer ${botConfig.jokeApiKey}`
                }
            })
            .then(resp => resp.json())
            .then(data => {
                const jkEmbed = new MessageEmbed()
                    .setTitle(`Blague ${data.type} *(#${data.id})*`)
                    .setColor('#ffae00')
                    .setDescription(`- **${data.joke}**\n- **${data.answer}**`)
                    .setTimestamp()
                    .setFooter('Made by Lack', 'https://i.imgur.com/JLhTSlQ.png');
                interaction.reply({ embeds: [jkEmbed] })
            })
    }
}