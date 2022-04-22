const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')
const axios = require('axios');
const botConfig = require('../../../cfg.json')
const NodeGeocoder = require('node-geocoder');

const geocoder = NodeGeocoder({
    provider: 'opencage',
    apiKey: botConfig.opencageApiKey
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meteo')
        .setDescription(`Donne la météo d\'une ville précise.`)
        .addStringOption(option => option.setName('city').setDescription('Ville de votre choix').setRequired(true)),

    async execute(interaction) {
        let city = interaction.options.getString('city')
        let lati, long;
        let msgmember = interaction.member
        geocoder.geocode(`${city}`, (err, res) => {
            if (err) throw err;
            if (!res[0]) return interaction.reply({
                content: `Erreur ! Je n'ai pas pu trouver cette ville... (\`${city}\`) Désolé :(`,
                ephemeral: true
            })
            lati = res[0].latitude
            long = res[0].longitude
            axios.get(`https://api.openweathermap.org/data/2.5/onecall?appid=${botConfig.wAPIKey}&lat=${lati}&lon=${long}&exclude=hourly,daily&lang=fr&units=metric`)
                .then(response => {
                    const apiResponse = response.data;
                    if (apiResponse.error) return interaction.reply({
                        content: `Erreur : ${apiResponse.error.info}`,
                        ephemeral: true
                    });
                    let rain;
                    if (apiResponse.current.rain) {
                        rain = apiResponse.current.rain['1h']
                    }
                    const meteoEmbed = new MessageEmbed()
                        .setColor('#b69f00')
                        .setTitle(`Météo actuelle à ${city}, ${res[0].country} :`)
                        .setDescription(`Conditions Météos : ${apiResponse.current.weather[0].description}`)
                        .setThumbnail(`https://openweathermap.org/img/wn/${apiResponse.current.weather[0].icon}@2x.png`)
                        .addField('Température : ', `${apiResponse.current.temp}℃`, true)
                        .addField('Ressenti :', `${apiResponse.current.feels_like}℃`, true)
                        .addField('Vitesse du vent :', `${apiResponse.current.wind_speed} km/h`, true)
                        .addField('Direction du vent :', `${apiResponse.current.wind_deg}°`, true)
                        .addField('Pression :', `${apiResponse.current.pressure} MilliBar`, true)
                        .addField('Pluie :', rain ? `${rain} Millimètres` : apiResponse.minutely ? `${apiResponse.minutely[apiResponse.minutely.length - 1].precipitation} Millimètres` : 'Pas d\'informations.', true)
                        .addField('Humidité :', `${apiResponse.current.humidity} %`, true)
                        .addField(`Index UV :`, `${apiResponse.current.uvi}`, true)
                        .addField(`Visibilité :`, `${apiResponse.current.visibility}`, true)
                        .addField(apiResponse.alerts ? "Alerte(s) dans la zone :" : "Aucune alerte(s) n'est à signaler.", apiResponse.alerts ? `Il y a une/des alerte(s) pour \`${apiResponse.alerts.map(o => o.event).join(', ')}\` dans votre zone !\nCliquez sur : 'Plus de détails' pour voir les détails.` : "Pas d'alerte(s) récente(s).")
                        .setTimestamp()
                        .setFooter('Made by Lack', 'https://i.imgur.com/JLhTSlQ.png');
                    interaction.reply({
                        content: 'Voici la météo :',
                        ephemeral: true
                    });
                    let channel = interaction.channel
                    channel.send({
                            embeds: [meteoEmbed]
                        })
                        .then(message => {
                            if (apiResponse.alerts) {
                                const row = new MessageActionRow()
                                    .addComponents(
                                        new MessageButton()
                                        .setCustomId('primary')
                                        .setLabel('Plus de détails')
                                        .setStyle('SECONDARY')
                                    );
                                message.edit({
                                    components: [row]
                                });
                                const filter = i => i.customId === 'primary' && i.user.id === msgmember.id;
                                const collector = message.channel.createMessageComponentCollector({
                                    filter,
                                    time: 10000
                                })
                                collector.on('collect', async(btn) => {
                                    if (btn.customId === 'primary') {
                                        const rows = apiResponse.alerts
                                        const generateEmbed = starting => {
                                                const embed = new MessageEmbed()
                                                    .setAuthor(`${interaction.client.user.tag}`, `${interaction.client.user.displayAvatarURL()}`)
                                                    .setColor('#00FF77')
                                                    .setTitle(`Voici les information de l'alerte #${starting+1} :`)
                                                    .setDescription(`\`\`\`\n- Émetteur : ${apiResponse.alerts[starting].sender_name}\n- Début de l'alerte : ${formatDate(apiResponse.alerts[starting].start)} - ${formatTime(apiResponse.alerts[starting].start)}\n- Fin de l'alerte : ${formatDate(apiResponse.alerts[starting].end)} - ${formatTime(apiResponse.alerts[starting].start)}\n- Description: ${apiResponse.alerts[starting].description}\n\`\`\``)
                                                    .setFooter(`Page : ${starting+1}/${rows.length}`)
                                                return embed
                                            } // ['⏪', '⬅️', '➡️', '⏩', '🗑️']
                                        await btn.update({
                                            content: '*Getting informations...*',
                                            components: [],
                                            embeds: []
                                        })
                                        message.channel.send({
                                            embeds: [generateEmbed(0)]
                                        }).then(message => {
                                            if (rows.length <= 1) return
                                            let btn_droite = new MessageButton()
                                                .setCustomId('btn_droite')
                                                .setLabel('➡️')
                                                .setStyle('SECONDARY')
                                            let btn_fin = new MessageButton()
                                                .setCustomId('btn_fin')
                                                .setLabel('⏩')
                                                .setStyle('SECONDARY')
                                            let btn_gauche = new MessageButton()
                                                .setCustomId('btn_gauche')
                                                .setLabel('⬅️')
                                                .setStyle('SECONDARY')
                                            let btn_deb = new MessageButton()
                                                .setCustomId('btn_deb')
                                                .setLabel('⏪')
                                                .setStyle('SECONDARY')
                                            let btn_trash = new MessageButton()
                                                .setCustomId('btn_trash')
                                                .setLabel('🗑️')
                                                .setStyle('SECONDARY')
                                            const row1 = new MessageActionRow()
                                                .addComponents(
                                                    btn_droite,
                                                    btn_fin,
                                                    btn_trash
                                                )
                                            const row2 = new MessageActionRow()
                                                .addComponents(
                                                    btn_deb,
                                                    btn_gauche,
                                                    btn_droite,
                                                    btn_fin,
                                                    btn_trash
                                                )
                                            const row3 = new MessageActionRow()
                                                .addComponents(
                                                    btn_gauche,
                                                    btn_deb,
                                                    btn_trash
                                                )
                                            message.edit({
                                                components: [row1]
                                            })
                                            let filter2 = i => i.customId === 'btn_droite' || i.customId === 'btn_fin' || i.customId === 'btn_gauche' || i.customId === 'btn_deb' || i.customId === 'btn_trash' && i.user.id === msgmember.id;
                                            const collector2 = message.channel.createMessageComponentCollector({
                                                filter2,
                                                time: 10000
                                            })
                                            let currentIndex = 0
                                            let trash = false;
                                            collector2.on('collect', async(btn) => {
                                                if (btn.customId === 'btn_gauche') {
                                                    currentIndex -= 1
                                                } else if (btn.customId === 'btn_droite') {
                                                    currentIndex += 1
                                                } else if (btn.customId === 'btn_fin') {
                                                    currentIndex = rows.length - 1
                                                } else if (btn.customId === 'btn_deb') {
                                                    currentIndex = 0
                                                } else if (btn.customId === 'btn_trash') {
                                                    message.delete()
                                                    trash = true;
                                                    return;
                                                } else {
                                                    return;
                                                }
                                                if (currentIndex !== 0) {
                                                    if (currentIndex + 1 == rows.length) {
                                                        btn.update({
                                                            components: [row3],
                                                            embeds: [generateEmbed(currentIndex)]
                                                        })
                                                    } else {
                                                        btn.update({
                                                            components: [row2],
                                                            embeds: [generateEmbed(currentIndex)]
                                                        })
                                                    }
                                                }
                                                if (currentIndex == 0) btn.update({
                                                    components: [row1],
                                                    embeds: [generateEmbed(currentIndex)]
                                                })
                                            })
                                            collector2.on('end', () => {
                                                if (!trash) message.edit({
                                                    components: [],
                                                    embeds: [generateEmbed(currentIndex)]
                                                })
                                            });;
                                        })
                                    }
                                })
                                collector.on('end', () => {

                                });
                            } else {
                                return;
                            }
                        });
                }).catch(error => {
                    console.log(error);
                });
        })

        function formatDate(date) {
            var d = new Date(date * 1000),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

        function formatTime(date) {
            var d = new Date(date * 1000),
                res = d.toLocaleTimeString('fr-FR');

            return res;
        }
    }
}