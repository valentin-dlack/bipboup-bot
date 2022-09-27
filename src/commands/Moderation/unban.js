const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions, MessageEmbed } = require("discord.js");
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
        .setName("unban")
        .setDescription("Unban un utilisateur")
        .addStringOption(option => option.setName("user_id").setDescription("L'id de l'utilisateur à unban").setRequired(true)),
    permissions: [Permissions.FLAGS.BAN_MEMBERS],
    category: "Moderation",

    async execute(interaction) {
        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, async(err, rows) => {
            if (err) throw err;
            let user_id = interaction.options.getString("user_id");

            let BannedUser;

            try {
                BannedUser = await interaction.client.users.fetch(user_id);
            } catch (error) {
                console.log(error);
                interaction.reply({ content: "L'utilisateur n'existe pas !", ephemeral: true });
                return;
            }

            await interaction.guild.bans.fetch();

            try {
                await interaction.guild.bans.fetch(user_id);
            } catch (error) {
                console.log(error);
                interaction.reply({ content: "L'utilisateur n'est pas banni !", ephemeral: true });
                return;
            }

            let logsChannel = interaction.guild.channels.cache.find(channel => channel.id === rows[0].log_channel);

            let unbanEmbed = new MessageEmbed()
                .setColor("#bc0000")
                .setDescription(`${BannedUser.username} a été unban du serveur ${interaction.guild.name}`)
                .addFields({ name: "Unban par :", value: `${interaction.user.username}` }, { name: "Date du unban :", value: `<t:${Math.round(new Date().getTime()/1000)}:F>` })
                .setFooter({ text: `Unban Logger`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })
                .setTimestamp();

            if (logsChannel === "0" || logsChannel === "" || logsChannel === null) {
                interaction.reply({ content: "Aucun channel de logs n'a été trouvé ! Le ban sera log dans vos messages privé", ephemeral: true });
            }

            if (logsChannel !== "none") {
                logsChannel.send({ embeds: [unbanEmbed] });
            } else {
                interaction.user.send({ embeds: [unbanEmbed] });
            }

            try {
                interaction.guild.members.unban(BannedUser, { reason: "Unban" });
                interaction.reply({ content: "L'utilisateur a été débanni !", ephemeral: true })
            } catch (error) {
                interaction.client.errorSend(error);
                return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
            }
        });
    }
}