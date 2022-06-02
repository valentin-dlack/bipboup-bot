const { createCanvas, loadImage } = require('canvas');
const { MessageEmbed, MessageAttachment } = require('discord.js');
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

    async execute(client, member) {
        const applyText = (canvas, text) => {
            const ctx = canvas.getContext('2d');
            let fontSize = 90;
            do {
                ctx.font = `${fontSize -= 10}px Poppins`;
            } while (ctx.measureText(text).width > canvas.width - 300);
            return ctx.font;
        };

        conn.query(`SELECT * FROM OPT_${member.guild.id} WHERE guild_id = ${member.guild.id}`, (err, rows) => {
            if (err) throw err;

            if (rows.length < 1) {
                return;
            } else {
                if (rows[0].welcomeMsg === true) {
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
                    const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

                    // do the role thing

                    member.guild.channels.cache.get(rows[0].log_channel).send(welcomeEmbed);
                }
            }
        });
    }
}