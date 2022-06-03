const { SlashCommandBuilder } = require('@discordjs/builders');
const turl = require('turl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite le bot sur ton serveur !'),
    permissions: [],
    category: 'Utilitaires',

    async execute(interaction) {
        let hlink = `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
        turl.shorten(hlink).then((res) => {
            interaction.user.send(`**Voici le lien pour m'inviter sur votre serveur ! Je suis content que vous me fassiez confiance** 😃\n<${res}>`);
        }).catch((err) => {
            interaction.client.errorSend(interaction, err);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        })

        interaction.reply({ content: `Le lien vous a été envoyé !`, ephemeral: true });
    }
}