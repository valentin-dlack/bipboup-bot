const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription(`Bah c'est un pile ou face`),

    async execute(interaction) {
        let coinState = Math.random();
        if (coinState > 0.5) {
            interaction.reply('Pile');
        } else if (coinState === 0.5) {
            interaction.reply('Tranche');
        } else {
            interaction.reply('Face')
        }
    }
}