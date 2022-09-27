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
    name: 'messageUpdate',
    once: false,

    async execute(oldMessage, newMessage, client) {
        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${oldMessage.guild.id}`, (err, rows) => {
            if (err) throw err;
            if (rows.length > 0) {
                if (rows[0].logEdit == true) {
                    let logChannel = oldMessage.guild.channels.cache.find(channel => channel.id === rows[0].log_channel);
                    if (!logChannel) return;

                    const attachment = oldMessage.attachments.size ? oldMessage.attachments.map(attachment => attachment.proxyURL) : null;

                    let timestamp = moment(Date.now()).format('DD/MM/YYYY HH:mm:ss');

                    if (oldMessage.content.length > 800) {
                        oldMessage.content = oldMessage.content.substring(0, 800) + '...';
                    }
                    if (newMessage.content.length > 800) {
                        newMessage.content = newMessage.content.substring(0, 800) + '...';
                    }

                    let logEmbed = new MessageEmbed()
                        .setColor('ORANGE')
                        .setTitle('Message Logs :')
                        .addFields({ name: `Informations :`, value: `\`\`\`diff\n▶ Message modifié dans : ${oldMessage.channel.name}\n▶ Ecrit par : ${oldMessage.author.tag}\n\`\`\`` }, { name: `Timestamp :`, value: `<t:${Math.floor(Date.now()/1000)}>` }, { name: `Contenu de l'ancien message :`, value: `\`\`\`${oldMessage.cleanContent ? oldMessage.cleanContent : "[Empty message]"}\`\`\`` }, { name: `Contenu du nouveau message :`, value: `\`\`\`${newMessage.cleanContent ? newMessage.cleanContent : "[Empty message]"}\`\`\`` }, { name: `Attachements de l'ancien message :`, value: `${attachment ? attachment.join('\n') : "No Attachements"}` })
                        .setFooter({ text: `ID du message : ${newMessage.id}`, iconURL: oldMessage.author.displayAvatarURL({ format: 'png' }) });

                    logChannel.send({ embeds: [logEmbed] });
                }
            }
        });
    }
};