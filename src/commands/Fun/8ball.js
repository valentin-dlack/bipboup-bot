const { SlashCommandBuilder } = require('@discordjs/builders');

const responses_list = [
    ` Essaye plus tard `,
    `Essaye encore `,
    `Pas d'avis `,
    `C'est ton destin `,
    `Le sort en est jeté `,
    `Une chance sur deux `,
    `Repose ta question `,
    `D'après moi oui `,
    `C'est certain `,
    `Oui absolument `,
    `Tu peux compter dessus `,
    `Sans aucun doute `,
    `Très probable `,
    `Oui `,
    `C'est bien parti `,
    `C'est non `,
    `Peu probable `,
    `Faut pas rêver `,
    `N'y compte pas `,
    `Impossible `
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Pose une question et le bot te réponds')
        .addStringOption(option => option.setName('input').setDescription('Posez la question').setRequired(true)),

    async execute(interaction) {
        let str = interaction.options.getString('input');
        let hBallState = Math.floor((Math.random() * 20));
        interaction.reply(`> ${str}\n${responses_list[hBallState]}`)
    }
}