const cfg = require('../../cfg.json');
const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');

const verificationLevels = {
    NONE: 'None',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    VERY_HIGH: 'Very High'
};

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

module.exports = {
    name: 'guildCreate',
    once: false,

    async execute(guild, client) {
        console.log(`> Joined guild ${guild.name} (${guild.id}) at ${new Date()}`);
        conn.query(`CREATE TABLE IF NOT EXISTS OPT_${guild.id} (guild_id VARCHAR(30) NOT NULL, log_channel VARCHAR(30) NOT NULL, mod_role VARCHAR(30) NOT NULL, welcomeMsg BOOLEAN, joinVerification BOOLEAN, memberCount BOOLEAN, logDel BOOLEAN, logEdit BOOLEAN)`, (err, rows) => {
            if (err) throw err;
            console.log(`> Created table OPT_${guild.id}`);
        });
        conn.query(`CREATE TABLE IF NOT EXISTS TEMPBANS_${guild.id} (ban_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, user_id VARCHAR(30) NOT NULL, reason VARCHAR(255) NOT NULL, time VARCHAR(30) NOT NULL)`, (err, rows) => {
            if (err) throw err;
            console.log(`> Created table TEMPBANS_${guild.id}`);
        });
        conn.query(`CREATE TABLE IF NOT EXISTS WARN_${guild.id} (warn_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, user_id VARCHAR(30) NOT NULL, reason VARCHAR(255) NOT NULL)`, (err, rows) => {
            if (err) throw err;
            console.log(`> Created table WARN_${guild.id}`);
        });

        console.log(`> Created tables for guild ${guild.name} (${guild.id})`);
        console.log(`> Filling Option table for guild ${guild.name} (${guild.id})`);

        conn.query(`SELECT * FROM OPT_${guild.id} WHERE guild_id = ${guild.id}`, (err, rows) => {
            if (err) throw err;

            if (rows.length < 1) {
                conn.query(`INSERT INTO OPT_${guild.id} (guild_id, log_channel, mod_role, welcomeMsg, joinVerification, memberCount, logDel, logEdit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [guild.id, '0', '0', false, false, false, false, false], (err, rows) => {
                    if (err) throw err;
                    console.log(`> Inserted guild ${guild.name} (${guild.id}) into guilds table`);
                });
            } else {
                console.log(`> Guild ${guild.name} (${guild.id}) already in guilds table`);
            }
        });

        console.log(`> Filled Option table for guild ${guild.name} (${guild.id})`);

        let welcomeEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('   -❯    Bonjour !    ❰-   ')
            .setThumbnail(guild.me.user.avatarURL({ format: 'jpg', dynamic: true, size: 256 }))
            .setDescription(`Après un peu de voyage, je suis bien arrivé chez vous ${guild.name} ! Heureux de vous rencontrer.`)
            .addField('Quelques informations sur moi :',
                `**❯❯ Nom : ${guild.me.user.username}**
                **❯❯ ID : ${guild.me.user.id}**
                **❯❯ Nombre de commandes : ${client.commands.size}**
                **❯❯ Nombre de serveurs : ${client.guilds.size}**
                **❯❯ Commande d'aide : \`/help\`**
                \u200b`
            )
            .addField(`Comment me configurer ?`, `❯❯ Pour ça, il faut faire la commande \`/setup\` et renseigner les informations nécessaires (seulement pour les admins).`)
            .setTimestamp()
            .setFooter({ text: 'Made by Lack, Thanks for adding :D', iconURL: 'https://i.imgur.com/JLhTSlQ.png'})

        const channels = guild.channels.cache
        let owner = await guild.fetchOwner()

        let logsEmbed = new MessageEmbed()
            .setColor('YELLOW')
            .setTitle('   -❯    GuildDevLogs    ❰-   ')
            .setDescription(`❯❯ Added the bot on a new guild :`)
            .addField('Informations :', 
                `Guild name : \`${guild.name}\`
                Guild ID : \`${guild.id}\`
                Guild Owner : ${owner.user.username + owner.user.discriminator}
                Client Joined at : \`${guild.joinedAt.toDateString()}, ${guild.joinedAt.toLocaleTimeString('fr-FR')}\`
                Verification Level : \`${verificationLevels[guild.verificationLevel]}\`
                Member Count : \`${guild.memberCount}\`
                Bot Count : \`${guild.members.cache.filter(member => member.user.bot).size}\`
                Text Channels : \`${channels.filter(channel => channel.type === 'text').size}\`
                Vocal Channels : \`${channels.filter(channel => channel.type === 'voice').size}\`
                \u200b`
            )
            .setTimestamp()
            .setFooter({ text: `Made by Lack - ${new Date()}`, iconURL: 'https://i.imgur.com/JLhTSlQ.png'})

        let system_channel = guild.systemChannel;
        if (system_channel) {
            system_channel.send({embeds: [welcomeEmbed]});
        }

        let guild_logs = client.channels.cache.get(cfg.errorHandler.guildlog_id);
        let logs_channel = client.channels.cache.find(channel => channel.id === cfg.errorHandler.channel_id);

        logs_channel.send({embeds: [logsEmbed]});
    }
};