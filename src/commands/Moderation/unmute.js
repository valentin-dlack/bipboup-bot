const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Dé-mute un utilisateur")
        .addUserOption(option => option.setName("user").setDescription("Utilisateur à mute").setRequired(true)),
    permissions: [Permissions.FLAGS.KICK_MEMBERS],
    category: "Moderation",

    async execute(interaction) {
        let user = interaction.options.getUser("user");

        const targetMember = interaction.guild.members.cache.find(member => member.id === user.id);

        try {

            targetMember.timeout(0, `unmute`);

            interaction.reply({ content: `${targetMember.user.username} a été dé-mute !`, ephemeral: false })
        } catch (error) {
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }

}