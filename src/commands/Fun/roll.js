const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription(`Lance un dé`)
        .addIntegerOption(option => option.setName('sides').setDescription("Nombre de faces du dé").setRequired(true)),
        

    async execute(interaction) {
        let sides = interaction.options.getInteger('sides');
        if (sides < 2) {
            interaction.reply(`Le dé doit avoir au moins 2 faces`);
            return;
        } else if (sides > Number.MAX_SAFE_INTEGER) {
            interaction.reply(`Le dé doit avoir moins de ${Number.MAX_SAFE_INTEGER} faces`);
            return;
        }
        let randomRoll = Math.floor(Math.random() * sides) + 1;
        interaction.reply(`J'ai fait un ${randomRoll}`);
    }
}