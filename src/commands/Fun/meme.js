const getMeme = require('random-puppy');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription(`Envoie un meme random trouvé sur reddit`),

    async execute(interaction) {
        let subreddit = "memes"
        getMeme(subreddit)
            .then(url => {
                interaction.reply(url);
            }).catch(err => {
                interaction.reply({ content: `Il y a une erreur : \`${err.message}\``, ephemeral: true });
            })
    }
}