const {SlashCommandBuilder} = require('@discordjs/builders');
const {inspect} = require("util");
const {Type} = require('@anishshobith/deeptype')
let tes = require("../../../cfg.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Execute du code JavaScript.')
        .addStringOption(option => option.setName('query').setDescription('JS à exécuter').setRequired(true)),
    permissions: [],
    ownerOnly: true,

    async execute(interaction) {
        let code = interaction.options.getString('query');
        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        if (code.includes("token")) {
            interaction.reply({ content: "Ça va je te gêne pas gros con ?", ephemeral: false });
            return;
        }
        let evaled;
        try {
            const start = process.hrtime();
            evaled = eval(code);
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }
            const stop = process.hrtime(start);
            const response = [
                `**Output:** \`\`\`js\n${interaction.client.cleanTxt(inspect(evaled, {depth: 0}))}\n\`\`\``,
                `**Type:** \`\`\`ts\n${new Type(evaled).is}\n\`\`\``,
                `**Time Taken:** \`\`\`${(((stop[0] * 1e9) + stop[1])) / 1e6}ms \`\`\``
            ]
            const res = response.join('\n');
            if (response.length < 2000) {
                await interaction.reply({
                    content: res
                })
            } else {
                const output = new MessageAttachment(Buffer.from(res), 'output.txt');
                await interaction.reply({
                    content: '',
                    files: [output]
                })
            }
        } catch (error) {
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    },
}