const { SlashCommandBuilder } = require('@discordjs/builders');
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
        .setName('setup')
        .setDescription('Permet de configurer le bot')
        .addChannelOption(option => option.setName('log_channel').setDescription('Le salon ou seront envoyé les logs').setRequired(true))
        .addRoleOption(option => option.setName('mod_role').setDescription('Le role de modération de votre serveur').setRequired(true)),
    permissions: ["ADMINISTRATOR"],
    category: 'Utilitaires',

    async execute(interaction) {
        let log_channel = interaction.options.getChannel('log_channel');
        let mod_role = interaction.options.getRole('mod_role');

        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
            if (err) throw err;

            if (rows.length < 1 || rows[0].log_channel == '0') {
                //update already existing guild
                conn.query(`UPDATE OPTIONS SET log_channel = '${log_channel.id}', mod_role = '${mod_role.id}' WHERE guild_id = ${interaction.guild.id}`, (err, rows) => {
                    if (err) throw err;
                    interaction.reply('Super ! La configuration de base a été effectuée avec succès !\n Vous pouvez maintenant changer les options avec la commande `/config` !');
                });
            } else {
                interaction.reply('Vous avez déjà configuré le bot !');
            }
        });
    }
}