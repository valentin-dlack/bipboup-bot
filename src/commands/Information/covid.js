const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-superfetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('covid')
        .setDescription(`Affiche les statistiques de COVID-19 selon le pays`)
        .addStringOption(option => option.setName('country').setDescription("Le pays à afficher").setRequired(false)),
        permissions: [],
        category: "Information",

    async execute(interaction) {
        let country = interaction.options.getString('country');
        if (!country) {
            country = 'all';
        }
        try {
            const data = await fetchStats(country);
            const covidEmbed = new MessageEmbed()
                .setColor('#089C2A')
                .setTitle(`COVID-19 ${country === 'all' ? 'dans le Monde' : 'en '+country}`)
                .setThumbnail(country === 'all' ? 'https://cdn-icons-png.flaticon.com/512/44/44386.png' : data.countryInfo.flag)
                .setTimestamp(data.updated)
                .addField('Informations :', `
                **• Population :** ${interaction.client.formatNumber(data.population)}
                **• Cas confirmés :** ${interaction.client.formatNumber(data.cases)} dont **${interaction.client.formatNumber(data.todayCases)}** aujourd'hui
                **• Cas décédés :** ${interaction.client.formatNumber(data.deaths)} dont **${interaction.client.formatNumber(data.todayDeaths)}** aujourd'hui
                **• Cas guéris :** ${interaction.client.formatNumber(data.recovered)} dont **${interaction.client.formatNumber(data.todayRecovered)}** aujourd'hui
                **• Cas actifs :** ${interaction.client.formatNumber(data.active)}
                **• Cas actifs/1M :** ${interaction.client.formatNumber(data.activePerOneMillion)}
                **• Réanimations :** ${interaction.client.formatNumber(data.critical)}
                **• Tests :** ${interaction.client.formatNumber(data.tests)}
                \u200b`)
                .setFooter({ text: 'Made By Lack - Source : https://disease.sh/', iconUrl: "https://i.imgur.com/JLhTSlQ.png" });
            return interaction.reply({ embeds: [covidEmbed] });
        } catch (error) {
            if (error.status === 404) {
                return interaction.reply(`Le pays ${country} n'existe pas`);
            }
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }
}

fetchStats = async (country) => {
    const { body } = await fetch.get(`https://disease.sh/v3/covid-19/${country === 'all' ? 'all' :`countries/${country}`}`);
    return body;
}