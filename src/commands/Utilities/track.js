const { SlashCommandBuilder } = require('@discordjs/builders');
const keys = require("../../../cfg.json")
const fetch = require('node-fetch');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('track')
        .setDescription(`Permet de suivre un colis et d'avoir des updates en DM`)
        .addStringOption(option => option.setName('input').setDescription('Numéro de colis a suivre').setRequired(true)),

    async execute(interaction) {
        console.log(`[{"number":"${interaction.options.getString("input")}"}]`);
        const data = {
            data: `[{"number":"${interaction.options.getString("input")}"}]`
        }
        const headers = {
            '17token': `${keys.trackApiKey}`,
        };
        axios.post('https://api.17track.net/track/v1/register', data, { headers })
            .then(function(response) {
                console.log(response);
            })
            .catch(function(error) {
                console.log(error);
            });
    }
}