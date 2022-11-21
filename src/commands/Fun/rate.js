const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rate')
        .setDescription(`Donne une note à quelque chose ou à quelqu'un`)
        .addStringOption(option => option.setName('thing').setDescription("Quelque chose").setRequired(true)),
    permissions: [],
    category: "Fun",

    async execute(interaction) {
        let thing = interaction.options.getString('thing');
        if (thing.toLowerCase("requine")) {
            return interaction.reply("MMMMMMMMMMMMMMMHHHHHHHH REQUIIINE 2000000/20");
        }
        let randomRate = Math.floor(Math.random() * 21);
        interaction.reply(`Je pense que ${thing} devrait avoir une note de ${randomRate}/20`);
    }
}