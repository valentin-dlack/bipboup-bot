const { MessageEmbed } = require('discord.js');
const cfg = require('../../cfg.json');
const guildId = cfg.errorHandler.guildlog_id;
const channel_id = cfg.errorHandler.channel_id;

module.exports = (client) => {
    client.errorSend = (interaction, error) => {
        let embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Erreur critique')
            .setDescription(`Une erreur est survenue sur le serveur ${interaction.guild.name} !`)
            .addFields({ name: 'Erreur :', value: `\`\`\`${error}\`\`\`` }, { name: 'Error Stack :', value: `\`\`\`${error.stack.substring(0, 900)}...\`\`\`` }, { name: 'Commande :', value: `\`\`\`${interaction.commandName}\`\`\`` }, { name: 'Utilisateur :', value: `\`\`\`${interaction.user.tag}\`\`\`` })
            .setTimestamp();
        client.channels.cache.get(channel_id).send({ embeds: [embed] });
    }
}