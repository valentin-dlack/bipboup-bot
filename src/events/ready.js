const cfg = require('../../cfg.json');
const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        conn.connect(err => {
            if (err) throw err;
            console.log(`> Connected to database ${cfg.db_name}`);
        });
        console.log(`Ready! Logged in as ${client.user.tag}`);

        // insert guilds into database

        client.guilds.cache.forEach(guild => {
            conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${guild.id}`, (err, rows) => {
                if (err) throw err;

                if (rows.length < 1) {
                    conn.query(`INSERT INTO OPTIONS (guild_id, log_channel, mod_role, verifiedRole, welcome_channel, welcomeMsg, joinVerification, memberCount, logDel, logEdit, memberCountChannel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [guild.id, '0', '0', '0', '0', false, false, false, false, false, '0'], (err, rows) => {
                        if (err) throw err;
                        console.log(`> Inserted guild ${guild.name} (${guild.id}) into guilds table`);
                        let welcomeEmbed = new MessageEmbed()
                            .setColor('GREEN')
                            .setTitle('   -❯    Hello !    ❰-   ')
                            .setThumbnail(guild.me.user.avatarURL({ format: 'jpg', dynamic: true, size: 256 }))
                            .setDescription(`My system has been updated to 3.0 ! You now have to setup options.`)
                            .addFields({
                                name: 'Some infos :',
                                value: `**❯❯ Name : ${guild.me.user.username}**
								**❯❯ ID : ${guild.me.user.id}**
								**❯❯ Command number : ${client.commands.size}**
								**❯❯ Server number : ${client.guilds.cache.size}**
								**❯❯ Help command : \`/help\`**
								\u200b`
                            }, { name: `How to setup options ?`, value: `❯❯ You need to use the \`/setup\` command and to put the necessary informations (Admins only !).` })
                            .setTimestamp()
                            .setFooter({ text: 'Made by Lack, New Update :D', iconURL: 'https://i.imgur.com/JLhTSlQ.png' })

                        let system_channel = guild.systemChannel;
                        if (system_channel) {
                            try {
                                if (system_channel.permissionsFor(guild.me).has('SEND_MESSAGES')) {
                                    system_channel.send({ embeds: [welcomeEmbed] });
                                }
                            } catch (error) {
                                console.log(`> Error while sending welcome message to ${guild.name} (${guild.id})`);
                            }
                        }
                    });
                } else {
                    console.log(`> Guild ${guild.name} (${guild.id}) already in guilds table`);
                }
            });
        });

        client.user.setPresence({ status: "online", });
        let i = 0;
        setInterval(() => {
            let activities_list = [
                    `/help || ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} users`,
                    `V 3.1.1 || On ${client.guilds.cache.size} servers`,
                    `/help || ${client.channels.cache.size} channels`,
                ] // creates an arraylist containing phrases you want your bot to switch through.
            client.user.setActivity(`${activities_list[i++ % activities_list.length]}`, { type: "WATCHING" }); // sets bot's activities to one of the phrases in the arraylist.
        }, 7000);
    },
};