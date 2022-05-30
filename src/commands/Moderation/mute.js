const {SlashCommandBuilder} = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const channel_names = require("../../../logs_names.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute un utilisateur")
        .addUserOption(option => option.setName("user").setDescription("Utilisateur à mute").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Raison du mute").setRequired(true))
        .addIntegerOption(option => option.setName("time").setDescription("Durée du mute (Minutes)").setRequired(true)),
    permissions: [ Permissions.FLAGS.KICK_MEMBERS ],
    category: "Moderation",

    async execute(interaction) {
        let user = interaction.options.getUser("user");
        let reason = interaction.options.getString("reason");
        let time = interaction.options.getInteger("time");

        const targetMember = interaction.guild.members.cache.find(member => member.id === user.id);

        try {
            if (targetMember.permissions.has("KICK_MEMBERS")) {
                interaction.reply({ content: "Je ne peux pas mute cet utilisateur !", ephemeral: true });
                return;
            }

            let logsChannel = "none"

            let muteEmbed = new MessageEmbed()
                .setColor("#bc0000")
                .setDescription(`${targetMember.user.username} a été mute du serveur ${interaction.guild.name}`)
                .addField("Mute par :", `${interaction.user.username}`)
                .addField("Raison :", `${reason}`)
                .addField("Durée du mute :", `${time} minutes`)
                .setTimestamp();

            for (let i = 0; i < channel_names.length; i++) {
                let channel = interaction.guild.channels.cache.find(channel => channel.name === channel_names[i]);
                if (channel) {
                    logsChannel = channel;
                    break;
                }
            }

            if (logsChannel === "none") {
                interaction.reply({ content: "Impossible de trouver le channel logs !", ephemeral: true });
                return;
            } else {
                logsChannel.send({embeds : [muteEmbed]});
            }

            targetMember.timeout(time * 60 * 1000, `${reason}`);

            interaction.reply({ content: `${targetMember.user.username} a été mute !`, ephemeral: false })
        } catch (error) {
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }

}