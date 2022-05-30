const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('infos')
		.setDescription('Te donnes toutes les infos importantes sur le bot !'),
	permissions: [],
	category: 'Utilitaires',
    async execute(interaction) {
        let infosEmbed = new MessageEmbed()
        .setAuthor({ name: `${interaction.client.user.tag}`, iconURL: `${interaction.client.user.avatarURL()}`})
        .setColor('00e5ff')
        .setTitle(`Informations :`)
        .setDescription(`Tu as besoin d'informations sur le bot, de moyens pour nous contacter ? Les voici :`)
        .addFields(
            { name: 'Le bot :', value: 'B1P B0UP est un bot crée par Lack et FuriousNCookie en Janvier 2020 afin de découvrir NodeJS et le JavaScript Backend. Nous expérimentons aussi les base de données ainsi que des APIs externes à Discord.' },
            { name: 'Un bug ? Un problème de sécurité ou une question ?\n Les moyens de nous contacter :', value: 'Par l\'email de support : [bipboup.bugs@gmail.com](mailto:bipboup.bugs@gmail.com)\nPar MP Twitter : [@Lack_off1](https://twitter.com/Lack_off1)\n Ou par MP Discord : Lack#0690', inline: true },
            { name: 'Besoin d\'aide pour les commandes du bot ?', value: 'Faites la commande /help', inline: true },
            { name: 'Envie de voir le développement du bot en direct ? Rejoignez le serveur :', value: '[discord-support](https://discord.gg/Nr3ZE6n)', inline: true },
        )
        interaction.reply({embeds: [infosEmbed]});
    }
};