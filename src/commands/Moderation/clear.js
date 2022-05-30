const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Efface un nombre défini de messages")
        .addIntegerOption(option => option.setName("number").setDescription("Nombre de messages à supprimer").setRequired(true)),

    async execute(interaction) {
        try {
            let number = interaction.options.getInteger("number");
    
            if (!interaction.memberPermissions.has("MANAGE_MESSAGES")) {
                interaction.reply({ content: "Vous n'avez pas la permission d'effacer des messages !", ephemeral: true });
                return;
            }
    
            if (number > 100) {
                console.log(number);
                for (let i = 0; i < Math.floor(number / 100); i++) {
                    interaction.channel.bulkDelete(100);
                }
                if (number % 100 !== 0) {
                    interaction.channel.bulkDelete(number % 100);
                }
            } else if (number > 0) {
                interaction.channel.bulkDelete(number);
            }
    
            interaction.reply({ content: `${number} messages ont été supprimés !`, ephemeral: true });
        } catch (error) {
            interaction.client.errorSend(error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }
}