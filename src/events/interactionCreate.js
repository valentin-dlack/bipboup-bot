const { MessageEmbed } = require("discord.js");
const config = require('../../cfg.json');
const mysql = require('mysql');

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: config.db_secret,
    database: config.db_name
});

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        //selectMenu collector
        if (interaction.isSelectMenu()) {
            if (interaction.customId === "warn_list_select") {
                conn.query(`SELECT * FROM WARNS WHERE warn_id = ${interaction.values[0]}`, (err, rows) => {
                    if (err) throw err;
                    let warn = rows[0];
                    let user = interaction.client.users.cache.find(user => user.id === warn.user_id)
                    let warnEmbed = new MessageEmbed()
                        .setColor("#bc0000")
                        .setDescription(`Avertissement :`)
                        .addFields({ name: "Utilisateur warn :", value: `${user.username}, ID : \`${user.id}\`` }, { name: "Raison :", value: `${warn.reason}` }, { name: "Date du warn :", value: `${warn.date}` }, { name: "ID du Warn :", value: `${warn.uid}` })
                        .setFooter({ text: `Warn manager`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })

                    interaction.update({ embeds: [warnEmbed] })
                })
            }
        }

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

            if (command.ownerOnly && interaction.user.id !== config.ownerID) {
                interaction.reply({ content: `Cette commande est réservée au propriétaire du bot...`, ephemeral: true });
                return;
            }
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};