const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const cfg = require('../../../cfg.json');
const mysql = require('mysql');

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute un utilisateur")
        .addUserOption(option => option.setName("user").setDescription("Utilisateur à mute").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Raison du mute").setRequired(true))
        .addIntegerOption(option => option.setName("time").setDescription("Durée du mute (Minutes)").setRequired(true)),
    permissions: [Permissions.FLAGS.KICK_MEMBERS],
    category: "Moderation",

    async execute(interaction) {
        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
            if (err) throw err;
            let user = interaction.options.getUser("user");
            let reason = interaction.options.getString("reason");
            let time = interaction.options.getInteger("time");

            const targetMember = interaction.guild.members.cache.find(member => member.id === user.id);

            try {
                if (targetMember.permissions.has("KICK_MEMBERS")) {
                    interaction.reply({ content: "Je ne peux pas mute cet utilisateur !", ephemeral: true });
                    return;
                }

                let logsChannel = rows[0].log_channel
                logsChannel = interaction.guild.channels.cache.find(channel => channel.id === logsChannel)

                let muteEmbed = new MessageEmbed()
                    .setColor("#bc0000")
                    .setDescription(`${targetMember.user.username} a été mute du serveur ${interaction.guild.name}`)
                    .addFields({ name: "Mute par :", value: `${interaction.user.username}` }, { name: "Raison :", value: `${reason}` }, { name: "Durée du mute :", value: `${time} minutes` })
                    .setTimestamp();

                if (logsChannel === "0" || logsChannel === "" || logsChannel === null) {
                    interaction.reply({ content: "Aucun channel de logs n'a été trouvé ! Le log sera log dans vos messages privé", ephemeral: true });
                }

                if (logsChannel !== "none") {
                    logsChannel.send({ embeds: [muteEmbed] });
                } else {
                    interaction.user.send({ embeds: [muteEmbed] });
                    return;
                }

                targetMember.timeout(time * 60 * 1000, `${reason}`);

                interaction.reply({ content: `${targetMember.user.username} a été mute !`, ephemeral: false })
            } catch (error) {
                interaction.client.errorSend(interaction, error);
                return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
            }
        });
    }

}