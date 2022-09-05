const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const cfg = require('../../cfg.json');
const mysql = require('mysql');

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

module.exports = {
    name: 'guildMemberAdd',
    once: false,

    async execute(member, client) {
        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${member.guild.id}`, async(err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                return;
            } else {
                if (rows[0].memberCount == true) {
                    let memberCount = member.guild.memberCount;
                    let memberCountChannel = member.guild.channels.cache.find(ch => ch.id === rows[0].memberCountChannel);
                    if (!memberCountChannel) {
                        let log_channel = member.guild.channels.cache.find(ch => ch.id === rows[0].log_channel);
                        if (!log_channel) {
                            return;
                        }
                        log_channel.send(`>- **INFO** -< Impossible de trouver le salon de comptage des membres.`);
                    }
                    memberCountChannel.setName(`Membres : ${memberCount}`);
                }
            }
        });
    }
}