const { createCanvas, loadImage } = require('canvas');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const cfg = require('../../cfg.json');
const mysql = require('mysql');

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

module.exports = {
    name: 'guildMemberAdd',
    once: false,

    async execute(member, client) {
        const applyText = (canvas, text) => {
            const ctx = canvas.getContext('2d');
            let fontSize = 90;
            do {
                ctx.font = `${fontSize -= 10}px Poppins`;
            } while (ctx.measureText(text).width > canvas.width - 300);
            return ctx.font;
        };

        conn.query(`SELECT * FROM OPTIONS WHERE guild_id = ${member.guild.id}`, async(err, rows) => {
            if (err) throw err;
            if (rows.length < 1) {
                return;
            } else {
                const welcomeMsg = async(member) => {
                    const canvas = createCanvas(700, 250);
                    const ctx = canvas.getContext('2d');

                    const background = await loadImage('https://i.imgur.com/LI2uYxw.png');
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = '#74037b';
                    ctx.strokeRect(0, 0, canvas.width, canvas.height);

                    ctx.font = '28px sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(`Bienvenue sur le serveur ${member.guild.name} !`, canvas.width / 2.5, canvas.height / 3.5);

                    ctx.font = applyText(canvas, `${member.user.username}`);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(`${member.user.username}`, canvas.width / 2.5, canvas.height / 1.8);
                    ctx.beginPath();
                    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png' }));
                    ctx.drawImage(avatar, 25, 25, 200, 200);

                    let channel = member.guild.channels.cache.find(ch => ch.id === rows[0].welcome_channel);

                    if (!channel) {
                        let log_channel = member.guild.channels.cache.find(ch => ch.id === rows[0].log_channel);
                        if (!log_channel) {
                            return;
                        }
                        log_channel.send(`${member.user.username} vient de rejoindre le serveur ! **Je n'ai pas trouv?? de salon de bienvenue**`);
                    }

                    channel.send({ content: `Bienvenue ${member} !`, files: [{ attachment: canvas.toBuffer(), name: 'welcome.png' }] });
                };


                if (rows[0].joinVerification == true) {
                    let verifiedRole = member.guild.roles.cache.find(role => role.id === rows[0].verifiedRole);
                    if (!verifiedRole) {
                        member.user.send('ERREUR CRITIQUE : Le r??le de v??rification n\'existe pas. Veuillez contacter un administrateur.');
                        return;
                    }

                    let verificationEmbed = new MessageEmbed()
                        .setAuthor({ name: 'V??rification de compte', iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true }) })
                        .setColor('#cc0000')
                        .setTitle('Message de v??rification')
                        .addField(`Bonjour ${member.user.username} !`,
                            `**Pour acc??der ?? l'enti??ret?? du serveur de ${member.guild.name} il faut :**
                        Valider que vous n'??tes pas un bot en cliquant sur ??? (vous avez 30 secondes)
                        \u200b`)
                        .setTimestamp()
                        .setFooter({ text: 'Join Verification', iconURL: 'https://i.imgur.com/JLhTSlQ.png' })

                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                            .setLabel("Verify")
                            .setStyle("PRIMARY")
                            .setEmoji("???")
                            .setCustomId("verify_btn"),
                            new MessageButton()
                            .setLabel("Cancel")
                            .setStyle("SECONDARY")
                            .setEmoji("???")
                            .setCustomId("cancel_btn"),
                        );

                    let msg = await member.user.send({
                        embeds: [verificationEmbed],
                        components: [row]
                    })

                    const collector = msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 30000 });

                    collector.on('collect', it => {
                        if (it.customId === 'verify_btn' && it.user.id === member.user.id) {
                            it.reply('Votre acc??s au serveur est maintenant valid?? !');
                            member.roles.add(verifiedRole);
                            msg.delete();
                            if (rows[0].welcomeMsg == true) {
                                welcomeMsg(member);
                            }
                            return
                        } else if (it.customId === 'cancel_btn' && it.user.id === member.user.id) {
                            it.reply('Vous avez ??t?? exclu du serveur !');
                            member.kick();
                            msg.delete();
                            return;
                        }
                    })

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            member.user.send('Pas de r??ponse apr??s 30 secondes, vous avez ??t?? exclu du serveur !');
                            member.kick();
                            msg.delete();
                            return;
                        }
                    });
                } else if (rows[0].welcomeMsg == true) {
                    welcomeMsg(member);
                }
            }
        });
    }
}