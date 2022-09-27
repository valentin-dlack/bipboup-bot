const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')
const path = require('path');
const fetch = require('node-superfetch');
const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(path.join(__dirname, '..', '..', 'assets', 'fonts', "Minecraft.ttf"), { family: 'Minecraft' })

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription(`Permet d'ajouter des effets à sa photo de profil`)
        .addSubcommand(subcommand =>
            subcommand
            .setName('pimp')
            .setDescription('Pimp ta photo de profile')
            .addStringOption(option => option.setName('gun').setDescription('Ajouter un gun sur votre photo')
                .addChoice('Droite', 'droite')
                .addChoice('Gauche', 'gauche')
                .addChoice('Les deux', 'all'))
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('show')
            .setDescription(`Envoie la photo de profile d'un utilisateur (toi-même par défaut)`)
            .addStringOption(option => option.setName('quality').setDescription(`Choisir la qualité dans laquelle l'image est envoyée`)
                .addChoice('Normale', 'nm')
                .addChoice(`Basse`, `lq`)
                .addChoice(`Haute`, `hq`)
                .addChoice(`Très haute`, `vhq`)
                .setRequired(true)
            )
            .addUserOption(option => option.setName('user').setDescription(`Choisi l'utilisateur dont tu veux voir la photo de profil`))
        ),
    permissions: [],
    category: "Fun",

    async execute(interaction) {
        if (interaction.options.getSubcommand() === "pimp") {
            let str = interaction.options.getString('gun');
            var { body } = await fetch.get(interaction.user.displayAvatarURL({ format: 'png', size: 512 }));
            switch (str) {
                case 'droite':
                    try {
                        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'gun-d.png'));
                        const data = await loadImage(body);
                        const canvas = createCanvas(data.width, data.height);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(data, 0, 0);
                        const ratio = (data.height / 2) / base.height;
                        const width = base.width * ratio;
                        ctx.drawImage(base, data.width - width, data.height - (data.height / 2), width, data.height / 2);
                        const attachment = canvas.toBuffer();
                        if (Buffer.byteLength(attachment) > 8e+6) return interaction.reply({ content: 'L\'image résultante est supérieur à 8Mb, je ne peux donc pas l\'envoyer...', ephemeral: true });
                        return interaction.reply({ files: [{ attachment, name: 'gun.png' }] });
                    } catch (err) {
                        interaction.reply({ content: `Une erreur est survenue ! Error : \`${err.message}\``, ephemeral: true });
                    }
                case 'gauche':
                    try {
                        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'gun-g.png'));
                        const data = await loadImage(body);
                        const canvas = createCanvas(data.width, data.height);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(data, 0, 0);
                        const ratio = (data.height / 2) / base.height;
                        const width = base.width * ratio;
                        ctx.drawImage(base, 0, data.height - (data.height / 2), width, data.height / 2);
                        console.log(data.width - width)
                        const attachment = canvas.toBuffer();
                        if (Buffer.byteLength(attachment) > 8e+6) return interaction.reply({ content: 'L\'image résultante est supérieur à 8Mb, je ne peux donc pas l\'envoyer...', ephemeral: true });
                        return interaction.reply({ files: [{ attachment, name: 'gun.png' }] });
                    } catch (err) {
                        interaction.reply({ content: `Une erreur est survenue ! Error : \`${err.message}\``, ephemeral: true });
                    }
                case 'all':
                    try {
                        const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'gun-d.png'));
                        const base2 = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'gun-g.png'));
                        const data = await loadImage(body);
                        const canvas = createCanvas(data.width, data.height);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(data, 0, 0);
                        const ratio = (data.height / 2) / base.height;
                        const width = base.width * ratio;
                        ctx.drawImage(base, data.width - width, data.height - (data.height / 2), width, data.height / 2);
                        ctx.drawImage(base2, 0, data.height - (data.height / 2), width, data.height / 2);
                        const attachment = canvas.toBuffer();
                        if (Buffer.byteLength(attachment) > 8e+6) return interaction.reply({ content: 'L\'image résultante est supérieur à 8Mb, je ne peux donc pas l\'envoyer...', ephemeral: true });
                        return interaction.reply({ files: [{ attachment, name: 'gun.png' }] });
                    } catch (err) {
                        interaction.reply({ content: `Une erreur est survenue ! Error : \`${err.message}\``, ephemeral: true });
                        console.log
                    }
                default:
                    interaction.reply({ content: 'Un des arguments passé n\'est pas valide... réessayez.', ephemeral: true })
            }
        } else if (interaction.options.getSubcommand() === 'show') {
            let member = interaction.options.getMember("user");
            let quality = interaction.options.getString('quality');
            if (!member) member = interaction.member
            let uRoleColor = member.roles.highest.hexColor
            if (!member) return interaction.reply({ content: "Impossible de trouver cet utilisateur !", ephemeral: true });
            if (quality === "hq") {
                sizeQual = 2048
            } else if (quality === "vhq") {
                sizeQual = 4096
            } else if (quality === "lq") {
                sizeQual = 128
            } else {
                sizeQual = 512
            }

            let userAvatar = member.user.avatarURL({ format: 'png', dynamic: true, size: sizeQual });
            let userPP = new MessageEmbed()
                .setColor(uRoleColor)
                .setTitle(`Photo de profil de ${member.user.username}`)
                .addFields({ name: `Qualité`, value: `${sizeQual} pixels`, inline: true })
                .setImage(userAvatar)
                .setTimestamp()
                .setFooter({ text: 'Made by Lack', iconURL: 'https://i.imgur.com/JLhTSlQ.png' });
            interaction.reply({
                embeds: [userPP]
            });
        }
    }
}