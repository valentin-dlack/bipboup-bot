const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const channel_names = require("../../../logs_names.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("exclu un utilisateur")
        .addUserOption(option => option.setName("user").setDescription("L'utilisateur à exclure").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Raison de l'exclusion").setRequired(true)),

    async execute(interaction) {
        let user = interaction.options.getUser("user");
        let reason = interaction.options.getString("reason");

        const targetMember = interaction.guild.members.cache.find(member => member.id === user.id);

        try {
            if (!interaction.memberPermissions.has("KICK_MEMBERS")) {
                interaction.reply({ content: "Vous n'avez pas la permission d'exclure des utilisateurs !", ephemeral: true });
                return;
            }
            if (!interaction.guild.me.permissions.has("KICK_MEMBERS")) {
                interaction.reply({ content: "Je n'ai pas la permission d'exclure des utilisateurs !", ephemeral: true });
                return;
            }
            if (targetMember.permissions.has("KICK_MEMBERS")) {
                interaction.reply({ content: "Je ne peux pas exclure cet utilisateur !", ephemeral: true });
                return;
            }

            let logsChannel = "none"

            let dmKickEmbed = new MessageEmbed()
                .setColor("#bc0000")
                .setDescription(`Vous avez été exclu du serveur ${interaction.guild.name}`)
                .addField("Exclu par :", `${interaction.user.username}`)
                .addField("Raison :", `${reason}`)
                .addField("Date de l'exclusion :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                .setFooter({ text: `Kick Logger`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 })})
                .setTimestamp();

            let kickEmbed = new MessageEmbed()
                .setColor("#bc0000")
                .setDescription(`${targetMember.user.username} a été exclu du serveur ${interaction.guild.name}`)
                .addField("Exclu par :", `${interaction.user.username}`)
                .addField("Raison :", `${reason}`)
                .addField("Date de l'exclusion :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
                .setFooter({ text: `Kick Logger`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 })})
                .setTimestamp();

            for (let i = 0; i < channel_names.length; i++) {
                let channel = interaction.guild.channels.cache.find(channel => channel.name === channel_names[i]);
                if (channel) {
                    logsChannel = channel;
                    break;
                }
            }
        
            if (logsChannel === "none") {
                interaction.channel.send("Aucun channel de logs n'a été trouvé ! Le message de log sera dans vos messages privé");
            }

            let kickMember = () => {
                targetMember.kick(reason);
            }

            targetMember.send({ embeds: [dmKickEmbed] });

            setTimeout(kickMember, 1000);

            if (logsChannel !== "none") {
                logsChannel.send({ embeds: [kickEmbed] });
            } else {
                interaction.user.send({ embeds: [kickEmbed] });
            }

            interaction.reply({ content: `${targetMember.user.username} a été exclu !`, ephemeral: true });
        } catch (error) {
            interaction.client.errorSend(interaction, error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }
}
