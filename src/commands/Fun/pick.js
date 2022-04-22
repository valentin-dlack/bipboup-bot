const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pick')
        .setDescription(`Je choisi une option parmis celles que vous avez données`)
        .addStringOption(option => option.setName('choices').setDescription("Tout les choix").setRequired(true))
        .addStringOption(option => option.setName('separator').setDescription("Séparateur entre les choix (défaut : ,)").setRequired(false)),

    async execute(interaction) {
        let choices = interaction.options.getString('choices');
        let separator = interaction.options.getString('separator');
        if (!separator) {
            separator = ',';
        }
        let choicesArray = choices.split(separator);
        let randomChoice = choicesArray[Math.floor(Math.random() * choicesArray.length)];
        interaction.reply(`Mon choix est : ${randomChoice}`);
    }
}