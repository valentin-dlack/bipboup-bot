const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const channel_names = require("../../../logs_names.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban un utilisateur")
        .addStringOption(option => option.setName("user_id").setDescription("L'id de l'utilisateur à unban").setRequired(true)),

    async execute(interaction) {
        let user_id = interaction.options.getString("user_id");

        if (!interaction.guild.me.permissions.has("BAN_MEMBERS")) {
            interaction.reply({ content: "Je n'ai pas la permission de faire ça !", ephemeral: true });
            return;
        }

        let BannedUser;

        try {
            BannedUser = await interaction.client.users.fetch(user_id);
        } catch (error) {
            console.log(error);
            interaction.reply({ content: "L'utilisateur n'existe pas !", ephemeral: true });
            return;
        }

        await interaction.guild.bans.fetch();

        try {
            await interaction.guild.bans.fetch(user_id);
        } catch (error) {
            console.log(error);
            interaction.reply({ content: "L'utilisateur n'est pas banni !", ephemeral: true });
            return;
        }

        let logsChannel = "none"

        let unbanEmbed = new MessageEmbed()
            .setColor("#bc0000")
            .setDescription(`${BannedUser.username} a été unban du serveur ${interaction.guild.name}`)
            .addField("Unban par :", `${interaction.user.username}`)
            .addField("Date du unban :", `<t:${Math.round(new Date().getTime()/1000)}:F>`)
            .setFooter({ text: `Unban Logger`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 })})
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

        try {
            interaction.guild.members.unban(BannedUser, {reason: "Unban"});
        } catch (error) {
            interaction.client.errorSend(error);
            return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
        }
    }
}