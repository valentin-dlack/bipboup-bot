const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageAttachment, Permissions, MessageActionRow, MessageSelectMenu } = require("discord.js");
const { v4: uuidv4 } = require('uuid');
const cfg = require('../../../cfg.json');
const mysql = require('mysql');

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Permet de gérer les avertissements d'un utilisateur (ajout, listing, suppression)")
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('Ajoute un avertissement à un utilisateur')
            .addUserOption(option => option.setName("user").setDescription("L'utilisateur à warn").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Raison de l'avertissement").setRequired(true)),
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('list')
            .setDescription(`Liste les avertissements d'un utilisateur`)
            .addUserOption(option => option.setName("user").setDescription("L'utilisateur à regarder").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('delete')
            .setDescription(`Supprime l'avertissement d'un utilisateur`)
            .addStringOption(option => option.setName("id").setDescription("ID de l'avertissement").setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Raison de la suppression").setRequired(true)),
        ),
    permissions: [Permissions.FLAGS.KICK_MEMBERS],
    category: "Moderation",

    async execute(interaction) {
        if (interaction.options.getSubcommand() == "add") {
            conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                let user = interaction.options.getUser('user');
                let reason = interaction.options.getString('reason');
                let err_uuid = false;

                const targetMember = interaction.guild.members.cache.find(member => member.id === user.id)

                if (!targetMember) return interaction.reply("L'utilisateur visé n'a pas été trouvé");

                let uid = uuidv4();
                let date = new Date().toLocaleString('fr-FR')

                let logsChannel = rows[0].log_channel
                logsChannel = interaction.guild.channels.cache.find(channel => channel.id === logsChannel)

                conn.query("INSERT INTO WARNS (guild_id, user_id, reason, uid, date) VALUES (?, ?, ?, ?, ?)", [interaction.guild.id, user.id, reason, uid, date], (err, rows) => {
                    if (err) {
                        if (err.code == "ER_DUP_ENTRY") {
                            err_uuid = true;
                            return interaction.reply("L'uuid du warn existe déjà, veuillez réessayer la commande :)")
                        }
                        interaction.client.errorSend(interaction, err);
                        return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
                    }
                    console.log(`[MySQL] -> New entry in WARNS : [${interaction.guild.id}, ${user.id}, ${uid}]`)
                });
                //ALTER TABLE `warns` ADD `uid` VARCHAR(255) NOT NULL ; 
                conn.query(`SELECT * FROM WARNS WHERE uid = '${uid}'`, (err, rows) => {
                    if (err) {
                        interaction.client.errorSend(interaction, err);
                        return interaction.reply(`Une erreur est survenue, le staff a été prévenu ! :(`);
                    }
                    if (err_uuid) return;
                    let dmWarnEmbed = new MessageEmbed()
                        .setColor("#bc0000")
                        .setDescription(`Vous avez reçu un avertissement sur le serveur ${interaction.guild.name} !`)
                        .addFields({ name: "Fait par :", value: `${interaction.user.username}` }, { name: "Raison de l'avertissement :", value: `${reason}` }, { name: "Date de l'avertissement :", value: `<t:${Math.round(new Date().getTime()/1000)}:F>` })
                        .setFooter({ text: `Warn ID : ${uid}`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })

                    let warnEmbed = new MessageEmbed()
                        .setColor("#bc0000")
                        .setDescription(`Warn logs manager`)
                        .addFields({ name: "Utilisateur warn :", value: `${user.username}, ID : \`${user.id}\`` }, { name: "Warn par :", value: `${interaction.user.username}, ID : \`${interaction.user.id}\`` }, { name: "Warn dans le channel :", value: `${interaction.channel.name}, ID : \`${interaction.channel.id}\`` }, { name: "Raison :", value: `${reason}` }, { name: "Date du warn :", value: `<t:${Math.round(new Date().getTime()/1000)}:F>` }, { name: "ID du Warn :", value: `${uid}` })
                        .setFooter({ text: `Warn manager`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })

                    targetMember.send({ embeds: [dmWarnEmbed] });

                    if (logsChannel === "0" || logsChannel === "" || logsChannel === null) {
                        interaction.reply({ content: "Aucun channel de logs n'a été trouvé ! Le ban sera log dans vos messages privé", ephemeral: true });
                    }

                    if (logsChannel !== "none") {
                        logsChannel.send({ embeds: [warnEmbed] });
                    } else {
                        interaction.user.send({ embeds: [warnEmbed] });
                        return;
                    }

                    return interaction.reply(`<@${user.id}> a reçu un avertissement pour \`${reason}\` !`);
                })
            });
        } else if (interaction.options.getSubcommand() == "list") {

            let user = interaction.options.getUser('user');
            let objects = [];

            conn.query(`SELECT * FROM WARNS WHERE user_id = ${user.id}`, async(err, rows) => {
                if (err) throw err;
                let count = 1;
                if (rows.length == 0) {
                    const file = new MessageAttachment('./src/assets/images/no_warns.png')
                    const noWarn = new MessageEmbed()
                        .setImage("attachment://no_warns.png")

                    return interaction.reply({ embeds: [noWarn], files: [file] });
                }
                await rows.forEach(warn => {
                    objects.push({
                        label: `Warn N°${count} - Date : ${warn.date}`,
                        description: `Raison : ${warn.reason}`,
                        value: `${warn.warn_id}`
                    })
                    count++;
                });

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                        .setCustomId('warn_list_select')
                        .setPlaceholder('Aucune Selection')
                        .addOptions(objects),
                    );

                await interaction.reply({ content: 'Voici la liste des warn :', components: [row] });
            })

        } else if (interaction.options.getSubcommand() == "delete") {
            let id = interaction.options.getString('id');
            let reason = interaction.options.getString('reason');

            //check if warn with the given id exists
            conn.query(`SELECT * FROM WARNS WHERE uid = '${id}'`, (err, rows) => {
                if (err) throw err;
                if (rows.length == 0) {
                    return interaction.reply({ content: "Il n'y a pas de warns existant avec cet ID\n*Note : l'ID est composé de tel sorte : `00000000-0000-0000-0000-000000000000`*", ephemeral: true });
                } else {
                    let user = interaction.client.users.cache.find(user => user.id === rows[0].user_id)

                    conn.query(`DELETE FROM WARNS WHERE uid = '${id}'`, (err) => {
                        if (err) throw err;
                    })

                    let unwarnEmbed = new MessageEmbed()
                        .setColor("#bc0000")
                        .setDescription(`Warn logs manager`)
                        .addFields({ name: "Suppression d'un warn :", value: `${user.username}, ID : \`${user.id}\`` }, { name: "Raison :", value: `${reason}` }, { name: "Date de la suppression :", value: `<t:${Math.round(new Date().getTime()/1000)}:F>` }, { name: "ID du Warn supprimé :", value: `${id}` })
                        .setFooter({ text: `Warn manager`, iconURL: interaction.guild.iconURL({ format: 'png', dynamic: true, size: 256 }) })

                    conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                        let logsChannel = rows[0].log_channel
                        logsChannel = interaction.guild.channels.cache.find(channel => channel.id === logsChannel)
                        if (logsChannel === "0" || logsChannel === "" || logsChannel === null) {
                            interaction.reply({ content: "Aucun channel de logs n'a été trouvé ! Le ban sera log dans vos messages privé", ephemeral: true });
                        }

                        if (logsChannel !== "none") {
                            logsChannel.send({ embeds: [unwarnEmbed] });
                        } else {
                            interaction.user.send({ embeds: [unwarnEmbed] });
                            return;
                        }
                    });

                    return interaction.reply(`Le warn \`${id}\` de \`${user.tag}\` a bien été supprimé !`)
                }
            })
        } else {
            interaction.reply({ content: "Not a valid subcommand :'(", ephemeral: true })
        }
    }

}