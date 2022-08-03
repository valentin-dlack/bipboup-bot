const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
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
        .setName('config')
        .setDescription('Permet de configurer le bot')
        .addSubcommand(subcommand =>
            subcommand
            .setName('infos')
            .setDescription('Voir quelles sont les options actives')
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('logs-channel')
            .setDescription('Changer le salon où seront envoyés les logs')
            .addChannelOption(option => option.setName('log_channel').setDescription('Le salon ou seront envoyé les logs').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('mod-role')
            .setDescription('Changer le role de modération de votre serveur')
            .addRoleOption(option => option.setName('mod_role').setDescription('Le role de modération de votre serveur').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('welcome-msg')
            .setDescription('Activer ou désactiver le message de bienvenue')
            .addBooleanOption(option => option.setName('welcome-msg').setDescription('Activer ou désactiver le message de bienvenue').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('join-verification')
            .setDescription('Activer ou désactiver la vérification "anti-raid" de l\'arrivée des nouveaux membres')
            .addBooleanOption(option => option.setName('join-verification').setDescription('Activer ou désactiver la vérification de l\'arrivée des nouveaux membres').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('member-count')
            .setDescription('Activer ou désactiver le compteur de membres')
            .addBooleanOption(option => option.setName('member-count').setDescription('Activer ou désactiver le compteur de membres').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('log-delete')
            .setDescription('Activer ou désactiver les logs lors de la suppression d\'un message')
            .addBooleanOption(option => option.setName('log-del').setDescription('Activer ou désactiver les logs lors de la suppression d\'un message').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('log-edit')
            .setDescription('Activer ou désactiver les logs lors de la modification d\'un message')
            .addBooleanOption(option => option.setName('log-edit').setDescription('Activer ou désactiver les logs lors de la modification d\'un message').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('verified-role')
            .setDescription('Changer le role vérifié (vérification anti-raid)')
            .addRoleOption(option => option.setName('verified-role').setDescription('Le role vérifié (vérification anti-raid)').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('welcome-channel')
            .setDescription('Changer le salon ou sera envoyé le message de bienvenue')
            .addChannelOption(option => option.setName('welcome-channel').setDescription('Le salon ou sera envoyé le message de bienvenue').setRequired(true))
        ),
    permissions: ["ADMINISTRATOR"],
    category: 'Utilitaires',

    async execute(interaction) {
        if (interaction.options.getSubcommand() === "infos") {
            conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;

                let log_channel = interaction.guild.channels.cache.get(rows[0].log_channel);
                let mod_role = interaction.guild.roles.cache.get(rows[0].mod_role);

                let embed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Configuration actuelle')
                    .addField('Salon des logs', log_channel ? `<#${log_channel.id}>` : 'Aucun salon de logs')
                    .addField('Role de modération', mod_role ? `<@&${mod_role.id}>` : 'Aucun role de modération')
                    .addField('Message de bienvenue', rows[0].welcomeMsg != "0" ? 'Activé' : 'Désactivé')
                    .addField('Vérification d\'arrivée', rows[0].joinVerification != "0" ? 'Activé' : 'Désactivé')
                    .addField('Compteur de membres', rows[0].memberCount != "0" ? 'Activé' : 'Désactivé')
                    .addField('Logs lors de la suppression d\'un message', rows[0].logDel != "0" ? 'Activé' : 'Désactivé')
                    .addField('Logs lors de la modification d\'un message', rows[0].logEdit != "0" ? 'Activé' : 'Désactivé')

                interaction.reply({ embeds: [embed] });
            });
        } else if (interaction.options.getSubcommand() === "logs-channel") {
            let log_channel = interaction.options.getChannel("log_channel");
            //update logs channel
            conn.query(`UPDATE OPTIONS SET log_channel = ${log_channel.id} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                interaction.reply('Le salon de logs a été mis à jour');
            });
        } else if (interaction.options.getSubcommand() === "mod-role") {
            let mod_role = interaction.options.getRole("mod_role");
            //update mod role
            conn.query(`UPDATE OPTIONS SET mod_role = ${mod_role.id} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                interaction.reply('Le role de modération a été mis à jour');
            });
        } else if (interaction.options.getSubcommand() === "welcome-msg") {
            let welcomeMsg = interaction.options.getBoolean("welcome-msg");
            //check if the welcome channel is set
            conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                if (rows[0].welcome_channel == "0") {
                    interaction.reply('Vous devez d\'abord définir le salon de bienvenue avec la commande `/config welcome-channel`');
                } else {
                    //update welcome msg
                    conn.query(`UPDATE OPTIONS SET welcomeMsg = ${welcomeMsg} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                        if (err) throw err;
                        interaction.reply('Le message de bienvenue a été mis à jour');
                    });
                }
            });
        } else if (interaction.options.getSubcommand() === "join-verification") {
            let joinVerification = interaction.options.getBoolean("join-verification");
            //check if the verification role is set
            conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                if (rows[0].verified_role == "0") {
                    interaction.reply('Vous devez d\'abord définir un role de vérification (voir la commande `/config verified-role`)');
                } else {
                    //update join verification
                    conn.query(`UPDATE OPTIONS SET joinVerification = ${joinVerification} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                        if (err) throw err;
                        interaction.reply('La vérification des nouveaux membres a été mis à jour');
                    });
                }
            });
        } else if (interaction.options.getSubcommand() === "member-count") {
            let memberCount = interaction.options.getBoolean("member-count");
            //update member count
            if (memberCount == true) {
                //create a new voice channel for the member count where you can't connect to it
                let memberCountChannel = interaction.guild.channels.create(`Membres : ${interaction.guild.memberCount}`, {
                    type: 'GUILD_VOICE',
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['CONNECT']
                        }
                    ]
                });
                //update member count channel
                conn.query(`UPDATE OPTIONS SET memberCount = ${memberCount} AND memberCountChannel = ${memberCountChannel.id} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                    if (err) throw err;
                    interaction.reply('Le compteur de membres a été mis à jour');
                });
            } else {
                //delete the member count channel
                interaction.guild.channels.cache.find(channel => channel.name === `Membres : ${interaction.guild.memberCount}`).delete();
                //update member count channel
                conn.query(`UPDATE OPTIONS SET memberCount = ${memberCount} AND memberCountChannel = 0 WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                    if (err) throw err;
                    interaction.reply('Le compteur de membres a été mis à jour');
                });
            }
        } else if (interaction.options.getSubcommand() === "log-delete") {
            let logDel = interaction.options.getBoolean("log-del");
            //update log delete
            conn.query(`UPDATE OPTIONS SET logDel = ${logDel} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                interaction.reply('Les logs lors de la suppression d\'un message ont été mis à jour');
            });
        } else if (interaction.options.getSubcommand() === "log-edit") {
            let logEdit = interaction.options.getBoolean("log-edit");
            //update log edit
            conn.query(`UPDATE OPTIONS SET logEdit = ${logEdit} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                interaction.reply('Les logs lors de la modification d\'un message ont été mis à jour');
            });
        } else if (interaction.options.getSubcommand() === "verified-role") {
            let verifiedRole = interaction.options.getRole("verified-role");
            //update verified role
            conn.query(`UPDATE OPTIONS SET verifiedRole = ${verifiedRole.id} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                interaction.reply('Le role vérifié a été mis à jour');
            });
        } else if (interaction.options.getSubcommand() === "welcome-channel") {
            let welcomeChannel = interaction.options.getChannel("welcome-channel");
            //update welcome channel
            conn.query(`UPDATE OPTIONS SET welcome_channel = ${welcomeChannel.id} WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                if (err) throw err;
                interaction.reply('Le salon de bienvenue a été mis à jour');
            });
        }

    }
}