module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {

            if (command.permissions && command.permissions.length > 0) {
                if (!interaction.memberPermissions.has(command.permissions)) {
                    interaction.reply({ content: `Tu n'as pas la permission d'executer cette commande...`, ephemeral: true });
                    return;
                } else if (!interaction.guild.me.permissions.has(command.permissions)) {
                    interaction.reply({ content: `Je n'ai pas la permission d'executer cette commande...`, ephemeral: true });
                    return;
                }
            }

            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};