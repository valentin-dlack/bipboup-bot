const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const pgbar = require('string-progressbar');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription(`Montre ton niveau et ton expérience actuelle`)
        .addUserOption(option => option.setName('user').setDescription("Utilisateur dont tu veux voir le niveau (optionnel)")),
        permissions: [],
        category: "XP",

    async execute(interaction) {
        let user = interaction.options.getUser('user');
        if (!user) user = interaction.user;
        
        client = interaction.client;

        let currentXP = await client.getExp(interaction.guild.id, user.id);
        let currentLevel = await client.getLevel(interaction.guild.id, user.id);
        let nextLevelXP = await client.getXpToNextLevel(interaction.guild.id, user.id);
        let rank = await client.getRank(interaction.guild.id, user.id);

        let bar = pgbar.filledBar(currentXP + nextLevelXP, currentXP, 15, "▬", "#")[0];

        let embed = new MessageEmbed()
            .setTitle(`Niveau de ${user.username}`)
            .setColor("BLURPLE")
            .setDescription(`**Rang actuel : #${rank}**\n\nTotal d'XP : ${currentXP}\n${currentLevel} [${bar}] ${currentLevel + 1}\n`)
            .setFooter({ text: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })})
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
}