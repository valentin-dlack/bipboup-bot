const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-superfetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription(`Génère des images aléatoires.`)
        .addSubcommand(subcommand =>
            subcommand
            .setName('art')
            .setDescription("Génère un tableau aléatoire"))
        .addSubcommand(subcommand =>
            subcommand
            .setName('cat')
            .setDescription("Génère une image aléatoire de chat")
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('furry')
            .setDescription("Génère une image aléatoire de furry")
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('personne')
            .setDescription("Génère une image aléatoire de personne")
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('waifu')
            .setDescription("Génère une image aléatoire de waifu")
        ),
        permissions: [],
        category: "Fun",

    async execute(interaction) {
        let imgMsg = new MessageEmbed()
            .setColor(interaction.guild.me.displayColor)
            .setTitle(`Image générée par IA`)
            .setTimestamp()
            .setFooter({text: 'Made by Lack', iconURL : 'https://i.imgur.com/JLhTSlQ.png'});

        if (interaction.options.getSubcommand() == "art") {

            const { body } = await fetch.get('https://thisartworkdoesnotexist.com/');
            imgMsg.setDescription('Cette œuvre n\'existe pas ')
            imgMsg.setImage('attachment://ai-artwork.jpg')
            interaction.reply({embeds: [imgMsg], files: [{attachment: body, name: 'ai-artwork.jpg'}]});

        } else if (interaction.options.getSubcommand() == "cat") {

            const { body } = await fetch.get('https://thiscatdoesnotexist.com/');
            imgMsg.setDescription('Ce chat n\'existe pas ')
            imgMsg.setImage('attachment://ai-artwork.jpg')
            interaction.reply({embeds: [imgMsg], files: [{attachment: body, name: 'ai-artwork.jpg'}]});

        } else if (interaction.options.getSubcommand() == "furry") {

            const num = Math.floor(Math.random() * 100000);
            imgMsg.setDescription(`Ce furry n\'existe pas\n*Numéro #${num}*`)
            imgMsg.setImage('attachment://ai-furso.jpg')
            interaction.reply({embeds: [imgMsg], files: [{attachment: `https://thisfursonadoesnotexist.com/v2/jpgs/seed${num.toString().padStart(5, '0')}.jpg`, name: 'ai-furso.jpg'}]});

        } else if (interaction.options.getSubcommand() == "personne") {

            const { body } = await fetch.get('https://thispersondoesnotexist.com/image');
            imgMsg.setDescription('Cette personne n\'existe pas ')
            imgMsg.setImage('attachment://ai-person.jpg')
            interaction.reply({embeds: [imgMsg], files: [{attachment: body, name: 'ai-person.jpg'}]});

        } else if (interaction.options.getSubcommand() == "waifu") {

            const num = Math.floor(Math.random() * 100000);
            imgMsg.setDescription(`Cette waifu n\'existe pas\n*Numéro #${num}*`)
            imgMsg.setImage('attachment://ai-waifu.jpg')
            if (message.channel.guild.id == "659289330010816525") {
                imgMsg.setDescription(`Cette waifu n\'existe pas\n*S/o Foxy, Numéro #${num}*`)
            }
            interaction.reply({embeds: [imgMsg], files: [{attachment: `https://www.thiswaifudoesnotexist.net/example-${num}.jpg`, name: 'ai-waifu.jpg'}]});

        }
    }
}