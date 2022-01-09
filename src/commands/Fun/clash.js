const { SlashCommandBuilder } = require('@discordjs/builders');
const clashs = require('../../assets/json/clash.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clash')
        .setDescription(`Clashez un autre utilisateur (ou vous même ¯\\_(ツ)_/¯)`)
        .addUserOption(option => option.setName('user').setDescription(`L'utilisateur à clasher`)),

    async execute(interaction) {
        let member = interaction.options.getMember('user');
        if (!member) member = interaction.member
        return interaction.reply(`Hey <@${member.id}> ${clashs[Math.floor(Math.random() * clashs.length)]}`)
    }
}