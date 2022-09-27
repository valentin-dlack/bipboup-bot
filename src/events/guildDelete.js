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
    name: 'guildDelete',
    once: false,

    async execute(guild, client) {
        console.log(`> Left guild ${guild.name} (${guild.id}) at ${new Date()}`);
        conn.query(`DELETE FROM OPTIONS WHERE guild_id = ${guild.id}`, (err, rows) => {
            if (err) throw err;
            console.log(`> Deleted guild ${guild.name} (${guild.id}) from guilds table`);
        })

        const d = new Date();
        const owner = await guild.fetchOwner()
        const channels = guild.channels.cache

        let deleteEmbed = new MessageEmbed()
            .setColor('YELLOW')
            .setTitle('   -❯    GuildDevLogs    ❰-   ')
            .setDescription(`❯❯ The bot leaved a server :( :`)
            .addFields({
                name: 'Informations :',
                value: `Guild name : \`${guild.name}\`
                Guild ID : \`${guild.id}\`
                Guild Owner : ${owner.user.username + owner.user.discriminator}
                Client Leaved at : \`${d.toDateString()}, ${d.toLocaleTimeString('fr-FR')}\`
                Verification Level : \`${verificationLevels[guild.verificationLevel]}\`
                Member Count : \`${guild.memberCount}\`
                Bot Count : \`${guild.members.cache.filter(member => member.user.bot).size}\`
                Text Channels : \`${channels.filter(channel => channel.type === 'GUILD_TEXT').size}\`
                Vocal Channels : \`${channels.filter(channel => channel.type === 'GUILD_VOICE').size}\`
                \u200b`
            })
            .setTimestamp()
            .setFooter({ text: `Made by Lack`, iconURL: 'https://i.imgur.com/JLhTSlQ.png' })

        let logs_channel = client.channels.cache.find(channel => channel.id === cfg.logger.channel_id);

        logs_channel.send({ embeds: [deleteEmbed] });

    }
}