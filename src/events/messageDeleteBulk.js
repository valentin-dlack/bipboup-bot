const { MessageEmbed } = require('discord.js');
const cfg = require('../../cfg.json');
const mysql = require('mysql');
const moment = require('moment');

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

module.exports = {
    name: 'messageDeleteBulk',
    once: false,

    async execute(messages, client) {
        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${messages.first().guild.id}`, (err, rows) => {
            if (err) throw err;

            if (rows[0].logDel == true) {
                let logChannel = messages.first().guild.channels.cache.find(channel => channel.id === rows[0].log_channel);
                if (!logChannel) return;

                let message_count = 0;

                messages.forEach(msg => {
                    message_count++;
                });

                let logEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('Message Logs :')
                    .addField(`Informations :`, `▶ Messages supprimés dans : <#${messages.first().channel.id}>`)
                    .addField(`Nombre de messages supprimés:`, `\`${message_count}\``)
                    .addField(`Timestamp :`, `<t:${Math.floor(Date.now()/1000)}>`)
                    .setFooter({ text: `Bulk Delete`, iconUrl: client.user.displayAvatarURL({ format: 'png' }) });

                logChannel.send({ embeds: [logEmbed] });
            }
        });
    }
};