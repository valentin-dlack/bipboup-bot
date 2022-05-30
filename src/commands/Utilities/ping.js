const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	permissions: [],
	category: 'Utilitaires',
	async execute(interaction) {
		try {
			const mesg = await interaction.reply({ content: "Pong!", fetchReply: true });
	  
			await interaction.editReply({ content: `Pong!\nBot Latency: \`${mesg.createdTimestamp - interaction.createdTimestamp}ms\`, Websocket Latency: \`${interaction.client.ws.ping}ms\`` });
		} catch (err) {
			interaction.client.errorSend(interaction, err);
			return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
		}
	},
};