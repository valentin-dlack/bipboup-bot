const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qi')
        .setDescription(`Je vous envoie votre QI ou celui de votre ami !`)
        .addUserOption(option => option.setName('user').setDescription("L'utilisateur à évaluer")),
        permissions: [],
        category: "Fun",

    async execute(interaction) {
        let user = interaction.options.getUser('user');
        if (!user) {
            user = interaction.user;
        }
        let qi = Math.floor(Math.random() * 150) + 1;
        if (qi == 143) {
            interaction.reply(`${user.username} a un QI de ${qi} ! \n https://image.noelshack.com/fichiers/2017/34/6/1503772969-kirby54.png`);
            return;
        }
        interaction.reply(`QI de ${user.username} : ${qi}`);
    }
}