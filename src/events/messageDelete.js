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
    name: 'messageDelete',
    once: false,

    async execute(message, client) {
        conn.query(`SELECT * FROM OPT_${message.guild.id} WHERE guild_id = ${message.guild.id}`, (err, rows) => {
            if (err) throw err;

            if (rows[0].logDel == true) {
                let logChannel = message.guild.channels.cache.find(channel => channel.id === rows[0].log_channel);
                if (!logChannel) return;

                const attachment = message.attachments.size ? message.attachments.map(attachment => attachment.proxyURL) : null;

                let timestamp = moment(message.createdAt).format('DD/MM/YYYY HH:mm:ss');

                if (message.content.length > 800) {
                    message.content = message.content.substring(0, 800) + '...';
                }

                let logEmbed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('Message Logs :')
                    .addField(`Informations :`, `\`\`\`diff\n▶ Message supprimé dans : ${message.channel.name}\n▶ Ecrit par : ${message.author.tag}\n\`\`\``)
                    .addField(`Timestamp :`, `\`\`\`${timestamp}\`\`\``)
                    .addField(`Contenu du message :`, `\`\`\`${message.cleanContent ? message.cleanContent : "[Empty message]"}\`\`\``)
                    .addField(`Attachements :`, `${attachment ? attachment.join('\n') : "No Attachements"}`)
                    .setFooter({text : `ID du message : ${message.id}`, iconUrl : message.author.displayAvatarURL({ format: 'png' })});

                logChannel.send({embeds: [logEmbed]});
            }
        });
    }
};