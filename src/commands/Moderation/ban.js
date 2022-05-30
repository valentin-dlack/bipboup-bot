const { SlashCommandBuilder} = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

const channel_names = [
    'logs',
    'logs-modération',
    'mods-logs',
    'logs-staff',
    'logs-staff-modération',
    'moderator-logs',
    "command-logs",
    "command-moderation",
    'bot',
    'bot-logs',
    'moderator-only',
    'user-log',
    'user-logs',
    'mod-log',
    'mod-logs',
    'log-discord',
    'mod-chat'
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription(`Bannir un utilisateur`)
        .addUserOption(option => option.setName('user').setDescription("L'utilisateur à bannir").setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription("Raison du ban").setRequired(true)),
    permissions: [Permissions.FLAGS.BAN_MEMBERS],
    category: "Moderation",

    async execute(interaction) {
        let user = interaction.options.getUser('user');
        let reason = interaction.options.getString('reason');

        const targetMember = interaction.guild.members.cache.find(member => member.id === user.id)

        try {
            if (targetMember.permissions.has("BAN_MEMBERS")) {
                interaction.reply({ content: "Je ne peux pas bannir cet utilisateur !", ephimeral: true });
                return;
            }

            let logsChannel = "none"
            let banId = Math.floor(Math.random() * Date.now()) + 1;
    
            let dmBanEmbed = new MessageEmbed()
                .setColor("#bc0000")
                .setDescription(`Vous avez été banni du serveur ${interaction.guild.name}`)
                .addField("Banni par :", `${interaction.user.username}`)
                .addField("Raison :", `${reason}`)
                .addField("Date du ban :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                .setFooter({ text: `ID du ban : #${banId}`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 })})
    
            let banEmbed = new MessageEmbed()
                .setColor("#bc0000")
                .setDescription(`Ban logs manager`)
                .addField("Utilisateur banni :", `${user.username}, ID : \`${user.id}\``)
                .addField("Banni par :", `${interaction.user.username}, ID : \`${interaction.user.id}\``)
                .addField("Banni dans le channel :", `${interaction.channel.name}, ID : \`${interaction.channel.id}\``)
                .addField("Raison :", `${reason}`)
                .addField("Date du ban :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                .addField("ID du ban :", `#${banId}`)
                .setFooter({ text: `Ban manager`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 })})
    
            for (let i = 0; i < channel_names.length; i++) {
                let channel = interaction.guild.channels.cache.find(channel => channel.name === channel_names[i]);
                if (channel) {
                    logsChannel = channel;
                    break;
                }
            }
    
            if (logsChannel === "none") {
                interaction.reply({ content: "Aucun channel de logs n'a été trouvé ! Le ban sera log dans vos messages privé", ephemeral: true });
            }
    
            let banMember = () => {
                targetMember.ban({
                    reason: `${reason}`,
                })
            }
            
            targetMember.send({ embeds: [dmBanEmbed] });
            
            setTimeout(banMember, 1000);
            if (logsChannel !== "none") {
                logsChannel.send({ embeds: [banEmbed] });
            } else {
                interaction.user.send({ embeds: [banEmbed] });
                return;
            }

            interaction.reply({ content: "L'utilisateur a bien été banni !"});
        } catch (error) {
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }
};