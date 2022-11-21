const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const cfg = require('../../cfg.json');
const mysql = require('mysql');

module.exports = {
    name: 'messageCreate',
    once: false,

    async execute(message, client) {
        if (message.guild.id !== "659289330010816525") return;
        if (message.content.toLowerCase().endsWith("bambou")) return message.reply("la !");

        if (message.author.bot) return;

        client.addExp(message);
    }
}