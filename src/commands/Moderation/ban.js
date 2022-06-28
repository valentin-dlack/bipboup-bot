const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
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
        .setName('ban')
        .setDescription(`Bannir un utilisateur`)
        .addUserOption(option => option.setName('user').setDescription("L'utilisateur à bannir").setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription("Raison du ban").setRequired(true)),
    permissions: [Permissions.FLAGS.BAN_MEMBERS],
    category: "Moderation",

    async execute(interaction) {
        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
            if (err) throw err;
            let user = interaction.options.getUser('user');
            let reason = interaction.options.getString('reason');

            const targetMember = interaction.guild.members.cache.find(member => member.id === user.id)

            try {
                if (targetMember.permissions.has("BAN_MEMBERS")) {
                    interaction.reply({ content: "Je ne peux pas bannir cet utilisateur !", ephimeral: true });
                    return;
                }

                let logsChannel = rows[0].log_channel
                let banId = Math.floor(Math.random() * Date.now()) + 1;

                let dmBanEmbed = new MessageEmbed()
                    .setColor("#bc0000")
                    .setDescription(`Vous avez été banni du serveur ${interaction.guild.name}`)
                    .addField("Banni par :", `${interaction.user.username}`)
                    .addField("Raison :", `${reason}`)
                    .addField("Date du ban :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                    .setFooter({ text: `ID du ban : #${banId}`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })

                let banEmbed = new MessageEmbed()
                    .setColor("#bc0000")
                    .setDescription(`Ban logs manager`)
                    .addField("Utilisateur banni :", `${user.username}, ID : \`${user.id}\``)
                    .addField("Banni par :", `${interaction.user.username}, ID : \`${interaction.user.id}\``)
                    .addField("Banni dans le channel :", `${interaction.channel.name}, ID : \`${interaction.channel.id}\``)
                    .addField("Raison :", `${reason}`)
                    .addField("Date du ban :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                    .addField("ID du ban :", `#${banId}`)
                    .setFooter({ text: `Ban manager`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })

                if (logsChannel === "0" || logsChannel === "" || logsChannel === null) {
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

                interaction.reply({ content: "L'utilisateur a bien été banni !" });
            } catch (error) {
                interaction.client.errorSend(interaction, error);
                return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
            }
        });
    }
};