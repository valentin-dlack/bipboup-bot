const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageEmbed
} = require('discord.js')
const path = require('path');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../../../user_db.db')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription(`setup !!! woohoo`)
        .addChannelOption(option => option.setName('channel-logs').setDescription("Enter the logs channel")),

    async execute(interaction) {
        let channel = interaction.options.getChannel('channel-logs');

        let res = dbCheck(interaction);
        console.log(res[0]);
        if (res[0] == true) {
            const stmt = db.prepare(`INSERT INTO opt_${interaction.guild.id} VALUES (?,?,?,?,?,?,?,?,?,?)`)
            stmt.run(interaction.guild.id, channel.id, true, true, true, true, true, true, true, true)
            stmt.finalize();
        } else {
            interaction.reply({
                content: `Il y a eu une erreur :( \n \`${res[1]}\``,
                ephemeral: true
            })
            return;
        }
        db.close();
        interaction.reply({
            content: "Wohoo !"
        })
    }
}

let dbCheck = (interaction) => {
    try {
        console.log(interaction.guild.id);
        db.run(`CREATE TABLE IF NOT EXISTS opt_${interaction.guild.id}(guild_id VARCHAR(255) NOT NULL, logs_chanId VARCHAR(255) NOT NULL, mods_roles TEXT NOT NULL, isWelcome boolean NOT NULL, isLogsRole boolean NOT NULL, isLogsJoin boolean NOT NULL, isLogsMsgDel boolean NOT NULL, isLogsMsgEdit boolean NOT NULL, isLogsInvite boolean NOT NULL, isLogsPfp boolean NOT NULL)`, (err) => {
            console.log(err);
            throw err;
        })
        return [true, 'no errors'];
    } catch (e) {
        return [false, e.message];
    }
}