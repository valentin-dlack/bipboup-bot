const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");
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
        .setName("kick")
        .setDescription("exclu un utilisateur")
        .addUserOption(option => option.setName("user").setDescription("L'utilisateur à exclure").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Raison de l'exclusion").setRequired(true)),
    permissions: [Permissions.FLAGS.KICK_MEMBERS],
    category: "Moderation",

    async execute(interaction) {
        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
            if (err) throw err;
            let user = interaction.options.getUser("user");
            let reason = interaction.options.getString("reason");

            const targetMember = interaction.guild.members.cache.find(member => member.id === user.id);

            try {
                if (targetMember.permissions.has("KICK_MEMBERS")) {
                    interaction.reply({ content: "Je ne peux pas exclure cet utilisateur !", ephemeral: true });
                    return;
                }

                let logsChannel = rows[0].log_channel

                let dmKickEmbed = new MessageEmbed()
                    .setColor("#bc0000")
                    .setDescription(`Vous avez été exclu du serveur ${interaction.guild.name}`)
                    .addField("Exclu par :", `${interaction.user.username}`)
                    .addField("Raison :", `${reason}`)
                    .addField("Date de l'exclusion :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                    .setFooter({ text: `Kick Logger`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })
                    .setTimestamp();

                let kickEmbed = new MessageEmbed()
                    .setColor("#bc0000")
                    .setDescription(`${targetMember.user.username} a été exclu du serveur ${interaction.guild.name}`)
                    .addField("Exclu par :", `${interaction.user.username}`)
                    .addField("Raison :", `${reason}`)
                    .addField("Date de l'exclusion :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                    .setFooter({ text: `Kick Logger`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })
                    .setTimestamp();

                if (logsChannel === "0" || logsChannel === "" || logsChannel === null) {
                    interaction.reply({ content: "Aucun channel de logs n'a été trouvé ! Le ban sera log dans vos messages privé", ephemeral: true });
                }

                let kickMember = () => {
                    targetMember.kick(reason);
                }

                targetMember.send({ embeds: [dmKickEmbed] });

                setTimeout(kickMember, 1000);

                if (logsChannel !== "none") {
                    logsChannel.send({ embeds: [kickEmbed] });
                } else {
                    interaction.user.send({ embeds: [kickEmbed] });
                }

                interaction.reply({ content: `${targetMember.user.username} a été exclu !`, ephemeral: true });
            } catch (error) {
                interaction.client.errorSend(interaction, error);
                return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
            }
        });
    }
}