const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription(`Montre le classement des membres du serveur`),
        permissions: [],
        category: "XP",

    async execute(interaction) {
        client = interaction.client;

        let leaderboard = await client.getLeaderboard(interaction.guild.id, interaction.user.id);
        let userRank = await client.getRank(interaction.guild.id, interaction.user.id);
        let lastRank = await client.getLastRankNumber(interaction.guild.id);

        console.log(leaderboard);

        if (userRank > 3) {
            let top3 = leaderboard[0].map((user, index) => {
                let username = client.users.cache.get(user.user_id).username;
                return `**${index + 1}.** ${username} - ${user.xp} XP`;
            }).join("\n");

            let usrIndex = userRank - 1;
            if (userRank == 4) {
                leaderboard[1].shift();
                usrIndex = userRank;
            }
            // if user is the last one, need to pop the last element
            if (userRank == lastRank) {
                leaderboard[1].pop();
                usrIndex = userRank - 2;
            }
            let userTop = leaderboard[1].map((user, index) => {
                let username = client.users.cache.get(user.user_id).username;
                return `**${index + usrIndex}.** ${username} - ${user.xp} XP`;
            }).join("\n");

            let embed = new MessageEmbed()
                .setTitle(`Classement du serveur ${interaction.guild.name}`)
                .setColor("BLURPLE")
                .setDescription(`**Ton Classement**\n${top3}${userRank == 4 ? '' : '\n...'}\n${userTop}`)
                .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })})
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } else {
            let top3 = leaderboard[0].map((user, index) => {
                let username = client.users.cache.get(user.user_id).username;
                return `**${index + 1}.** ${username} - ${user.xp} XP`;
            }).join("\n");

            let embed = new MessageEmbed()
                .setTitle(`Classement du serveur ${interaction.guild.name}`)
                .setColor("BLURPLE")
                .setDescription(`**Ton classement**\n${top3}`)
                .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })})
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        }
    }
}