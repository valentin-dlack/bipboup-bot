const { SlashCommandBuilder } = require('@discordjs/builders');
const turl = require('turl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite le bot sur ton serveur !'),
    permissions: [],
    category: 'Utilitaires',

    async execute(interaction) {
        let hlink = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot&permissions=8`;
        turl.shorten(hlink).then((res) => {
            interaction.user.send(`**Voici le lien pour m'inviter sur votre serveur ! Je suis content que vous me fassiez confiance** 😃\n<${res}>`);
        }).catch((err) => {
            interaction.client.errorSend(interaction, err);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        })

        interaction.reply({ content: `Le lien vous a été envoyé !`, ephemeral: true });
    }
}