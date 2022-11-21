const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription(`Donne un nombre défini d'XP à un utilisateur`)
        .addIntegerOption(option => option.setName('xp').setDescription("Nombre d'XP à donner").setRequired(true))
        .addUserOption(option => option.setName('user').setDescription("Utilisateur à qui tu veux donner de l'XP (optionnel)")),
        permissions: ["MANAGE_GUILD"],
        category: "XP",

    async execute(interaction) {
        let user = interaction.options.getUser('user');
        if (!user) user = interaction.user;
        
        client = interaction.client;

        let xp = interaction.options.getInteger('xp');
        if (xp < 0) {
            interaction.reply(`Tu ne peux pas donner un nombre négatif d'XP`);
            return;
        }

        // make a confirmation message with a button
        let embed = new MessageEmbed()
            .setTitle(`Confirmation`)
            .setColor("YELLOW")
            .setDescription(`Voulez-vous vraiment donner ${xp} XP à ${user.username} ?`)
            .setFooter({ text: `XP Manager`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })})
            .setTimestamp();

        let row = new MessageActionRow()
            .addComponents(
                {
                    type: 'BUTTON',
                    customId: 'confirm',
                    label: 'Confirmer',
                    style: 'SUCCESS'
                },
                {
                    type: 'BUTTON',
                    customId: 'cancel',
                    label: 'Annuler',
                    style: 'DANGER'
                }
            );

        interaction.reply({ embeds: [embed], components: [row] });

        // wait for the user to click on a button
        let filter = i => i.user.id === interaction.user.id;
        let collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                await client.giveExp(interaction.guild.id, user.id, xp);
                let newLevel = await client.getLevel(interaction.guild.id, user.id);
                let newXP = await client.getExp(interaction.guild.id, user.id);

                let embed = new MessageEmbed()
                    .setTitle(`Niveau de ${user.username}`) 
                    .setColor("GREEN")
                    .setDescription(`**- L'XP de ${user.username} à bien été changé -**\n**Nouveau niveau : ${newLevel}**\n\nTotal d'XP : ${newXP}`)
                    .setFooter({ text: `XP Manager`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })})
                    .setTimestamp();

                interaction.editReply({ embeds: [embed], components: [] });
            } else if (i.customId === 'cancel') {
                let embed = new MessageEmbed()
                    .setTitle(`Confirmation`)
                    .setColor("RED")
                    .setDescription(`La commande a été annulée.`)
                    .setFooter({ text: `XP Manager`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })})
                    .setTimestamp();

                interaction.editReply({ embeds: [embed], components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                let embed = new MessageEmbed()
                    .setTitle(`Confirmation`)
                    .setColor("RED")
                    .setDescription(`La commande a été annulée, pas de réponses dans les 15 secondes.`)
                    .setFooter({ text: `XP Manager`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })})
                    .setTimestamp();

                interaction.editReply({ embeds: [embed], components: [] });
            }
        });
    }
}