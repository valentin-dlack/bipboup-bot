const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tierlist')
        .setDescription(`Créer une tierlist avec vos choix`)
        .addStringOption(option => option.setName('choices').setDescription("Tout les choix").setRequired(true))
        .addStringOption(option => option.setName('separator').setDescription("Séparateur entre les choix (défaut : ,)").setRequired(false)),
        permissions: [],
        category: "Fun",

    async execute(interaction) {
        let choices = interaction.options.getString('choices');
        let separator = interaction.options.getString('separator');
        if (!separator) {
            separator = ',';
        }
        let choicesArray = choices.split(separator);
        interaction.reply(interaction.client.shuffle(choicesArray).map((choice, index) => `${index + 1}. ${choice}`).join('\n'));
    }
}