const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', "Minecraft.ttf"), { family: 'Minecraft' })

module.exports = {
    data: new SlashCommandBuilder()
        .setName('achievement')
        .setDescription('Transforme votre message en achievement minecraft')
        .addStringOption(option => option.setName('input').setDescription('Message').setRequired(true)),

    async execute(interaction) {
        let str = interaction.options.getString('input');
        try {
            const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'achievement.png'));
            const canvas = createCanvas(base.width, base.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(base, 0, 0);
            ctx.font = '17px Minecraftia';
            ctx.fillStyle = '#ffff00';
            ctx.fillText('Achievement Get!', 60, 40);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(interaction.client.shortenText(ctx, str, 230), 60, 60);
            return interaction.reply({ files: [{ attachment: canvas.toBuffer(), name: 'achievement.png' }] });
        } catch (err) {
            return interaction.reply(`Error: \`${err.message}\`. TAL !`);
        }
    }
}