const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../../cfg.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles.')
        .addStringOption(option => option.setName('command').setDescription('Commande à afficher.').setRequired(false)),
    permissions: [],
    category: 'Utilitaires',
    async execute(interaction) {
        try {
            let command = interaction.options.getString('command');

            if (command) {
                let commandData = interaction.client.commands.get(command);

                if (!commandData) {
                    return interaction.reply('Cette commande n\'existe pas.');
                }

                let embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setFooter({ text: 'Made by Lack', iconURL: 'https://i.imgur.com/JLhTSlQ.png' })
                    .setAuthor({ name: `Commande :  ${commandData.data.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setDescription(
                        `**• Description : ${commandData.data.description}**\n
                **• Catégorie : ${commandData.category}**\n
                **• Options : **`
                    );

                if (commandData.data.options) {
                    for (let i = 0; i < commandData.data.options.length; i++) {
                        let option = commandData.data.options[i];
                        embed.addFields({ name: `${interaction.client.capitalize(option.name)}`, value: `${option.description}`, inline: true });
                    }
                }

                interaction.reply({ embeds: [embed] });
            } else {
                const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setAuthor({ name: `Menu D'Aide de ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setDescription(`Nombre de commandes : ${interaction.client.commands.size}`)
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setFooter({ text: 'Made by Lack', iconURL: 'https://i.imgur.com/JLhTSlQ.png' })
                    .setThumbnail();

                if (interaction.user.id !== ownerID) {
                    categories = interaction.client.removeDuplicates(interaction.client.commands.filter(c => c.category !== 'Owner').map(c => c.category));
                } else {
                    categories = interaction.client.removeDuplicates(interaction.client.commands.map(cmd => cmd.category));
                }

                for (const category of categories) {
                    embed.addFields({ name: `**${category}**`, value: interaction.client.commands.filter(cmd => cmd.category === category).map(cmd => `\`${cmd.data.name}\``).join(' ') })
                }

                interaction.user.send({ embeds: [embed] });
                interaction.user.send("**Pour toute informations sur le bot et sur comment contacter les développeurs, faites la commande** `/infos`\nPour plus d'informations sur une certaine commande, faites \`/help [commande]\` !")
                interaction.reply({ content: "📬 Vous avez reçu un message privé avec la liste des commandes disponibles.", ephemeral: true });
            }
        } catch (error) {
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    },
};