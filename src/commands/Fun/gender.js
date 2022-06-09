const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gender')
        .setDescription(`Décide du genre d'un prénom`)
        .addStringOption(option => option.setName('name').setDescription('Nom de votre choix').setRequired(true)),
    permissions: [],
    category: "Fun",

    async execute(interaction) {
        let name = interaction.options.getString('name');
        try {
            const resp = await fetch(`https://api.genderize.io?name=${name}`);
            resp.json().then(data => {
                console.log(data.name);
            });
        } catch (error) {
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }
}