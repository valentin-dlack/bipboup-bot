const { SlashCommandBuilder } = require('@discordjs/builders');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const path = require('path');
const fetch = require('node-superfetch');
const coord1 = [-25, -33, -42, -14];
const coord2 = [-25, -13, -34, -10];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trigger')
        .setDescription(`Applique un trigger sur un avatar`)
        .addUserOption(option => option.setName('user').setDescription("L'utilisateur à qui appliquer le trigger").setRequired(false)),

    async execute(interaction) {
        let user = interaction.options.getUser('user');
        if (!user) {
            user = interaction.user;
        }
        let avatarURL = user.displayAvatarURL({ format: 'png', size: 512 });

        try {
            const base = await loadImage(path.join(__dirname, '../../assets/images/triggered.png'));
            const { body } = await fetch.get(avatarURL);
            const avatar = await loadImage(body);
            const encoder = new GIFEncoder(base.width, base.width);
            const canvas = createCanvas(base.width, base.width);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, base.width, base.height);
            const stream = encoder.createReadStream();
            encoder.start();
            encoder.setRepeat(0);
            encoder.setDelay(50);
            encoder.setQuality(200);
            for (let i = 0; i < 4; i++) {
                interaction.client.drawImageWithTint(ctx, avatar, 'red', coord1[i], coord2[i], 300, 300);
                ctx.drawImage(base, 0, 218, 256, 38);
                encoder.addFrame(ctx);
            }
            encoder.finish();
            const buffer = await interaction.client.streamToArray(stream);
            return interaction.reply({ content:'Triggered !', files: [{ attachment: Buffer.concat(buffer), name: 'trigger.gif' }] });
        } catch (error) {
            return interaction.reply(`Une erreur est survenue : ${error}`);
        }
    }
}