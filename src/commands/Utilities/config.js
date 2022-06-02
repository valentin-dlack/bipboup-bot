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
                .addBooleanOption(option => option.setName('welcomeMsg').setDescription('Activer ou désactiver le message de bienvenue').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('join-verification')
                .setDescription('Activer ou désactiver la vérification "anti-raid" de l\'arrivée des nouveaux membres')
                .addBooleanOption(option => option.setName('joinVerification').setDescription('Activer ou désactiver la vérification de l\'arrivée des nouveaux membres').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('member-count')
                .setDescription('Activer ou désactiver le compteur de membres')
                .addBooleanOption(option => option.setName('memberCount').setDescription('Activer ou désactiver le compteur de membres').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('log-delete')
                .setDescription('Activer ou désactiver les logs lors de la suppression d\'un message')
                .addBooleanOption(option => option.setName('logDel').setDescription('Activer ou désactiver les logs lors de la suppression d\'un message').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('log-edit')
                .setDescription('Activer ou désactiver les logs lors de la modification d\'un message')
                .addBooleanOption(option => option.setName('logEdit').setDescription('Activer ou désactiver les logs lors de la modification d\'un message').setRequired(true))
        ),
    permissions: ["ADMINISTRATOR"],
    category: 'Utilitaires',

    async execute(interaction) {

    }
}