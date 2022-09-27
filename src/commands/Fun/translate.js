const { SlashCommandBuilder } = require('@discordjs/builders');
const translate = require('google-translate-api-x');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription(`Traduit un texte en français`)
        .addStringOption(option => option.setName('text').setDescription("Le texte à traduire").setRequired(true)),
    permissions: [],
    category: "Fun",

    async execute(interaction) {
        let text = interaction.options.getString('text');
        translate(text, { to: 'fr' }).then(res => {
            interaction.reply(res.text);
        }).catch(err => {
            interaction.reply(`Une erreur est survenue : ${err}`);
        });
    }
}