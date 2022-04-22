const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, UserFlags, version: djsversion } = require('discord.js')
const { version } = require('../../../package.json');
const os = require('os');
const ms = require('ms');

const flags = {
    DISCORD_EMPLOYEE: 'Discord Employee',
    DISCORD_PARTNER: 'Discord Partner',
    BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
    BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
    HYPESQUAD_EVENTS: 'HypeSquad Events',
    HOUSE_BRAVERY: 'House of Bravery',
    HOUSE_BRILLIANCE: 'House of Brilliance',
    HOUSE_BALANCE: 'House of Balance',
    EARLY_SUPPORTER: 'Early Supporter',
    TEAM_USER: 'Team User',
    SYSTEM: 'System',
    VERIFIED_BOT: 'Verified Bot',
    EARLY_VERIFIED_BOT_DEVELOPER: 'Early Verified Bot Developer'
};

const filterLevels = {
    DISABLED: 'Off',
    MEMBERS_WITHOUT_ROLES: 'Membres sans aucun roles',
    ALL_MEMBERS: 'Tout le monde'
};
const verificationLevels = {
    NONE: 'None',
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: '(╯°□°）╯︵ ┻━┻',
    VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Donne les informations selon votre choix')
        .addSubcommand(subcommand =>
            subcommand
            .setName('user')
            .setDescription("Informations sur un utilisateur (mentionné ou vous-même)")
            .addUserOption(option => option.setName("target").setDescription("L'utilisateur sélectionné")))
        .addSubcommand(subcommand =>
            subcommand
            .setName('server')
            .setDescription("Information sur le serveur")
        )
        .addSubcommand(subcommand =>
            subcommand
            .setName('client')
            .setDescription("Informations sur le bot")
        ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === "user") {
            let member = interaction.options.getMember("target");
            if (!member) member = interaction.member
            let userInfoEmbed;
            if (!member) await interaction.reply("Impossible de trouver cet utilisateur !")
            let banAbText = "Oui";
            let Muted = "Non";
            let StatutTXT = "";
            let botState = "Oui";
            let boosterSince = Math.round(member.premiumSinceTimestamp / 1000);
            let boosterState = `Oui depuis : <t:${boosterSince}:R>`;
            let userStat = "Indéfini !"
            const roles = member.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString())
                .slice(0, -1);
            let uRoleMuted = member.roles.highest.name;
            let bannable = member.bannable;
            let bots = member.user.bot;

            let status = member.presence == null ? "offline" : member.presence.status;
            let userAvatar = member.user.avatarURL({ format: 'png', dynamic: true, size: 256 });
            let userActivity = member.presence == null ? "Aucune" : member.presence.activities
            console.log(member.user.flags);
            const userFlags = member.user.flags == null ? [] : member.user.flags.toArray()
            console.log(userFlags);

            if (!bots && member.presence != null) {
                if (!member.presence.activities) {
                    userActivity = "Pas de status/Offline";
                } else if (userActivity[1]) {
                    userActivity = userActivity[1].toString();
                } else if (userActivity[0]) {
                    userActivity = userActivity[0].state.toString();
                } else {
                    userActivity = "Indéfini !"
                }
            }
            if (!bannable) banAbText = "Non";
            if (!bots) botState = "Non";
            if (!boosterSince) boosterState = "Non";
            if (uRoleMuted === "Muted") Muted = "Oui";
            if (!bots) {
                if (status != "offline") {
                    let desktopStat = member.presence.clientStatus.desktop;
                    let mobileStat = member.presence.clientStatus.mobile;
                    let webStat = member.presence.clientStatus.web;
                    if (!desktopStat && !mobileStat && webStat) {
                        userStat = "Web"
                    } else if (!mobileStat && !webStat && desktopStat) {
                        userStat = "Desktop App"
                    } else if (!desktopStat && !webStat && mobileStat) {
                        userStat = "Mobile App"
                    } else if (!webStat && mobileStat && desktopStat) {
                        userStat = "Desktop & Mobile App"
                    } else {
                        userStat = "Indéfini !"
                    }
                }
            }

            if (status === "online") {
                StatutTXT = "<:green_circle:715615233124860015> En ligne."
            } else if (status === "idle") {
                StatutTXT = "<:orange_circle:715615275013374072> AFK."
            } else if (status === "offline") {
                StatutTXT = "<:black_circle:715618257549131826> Hors ligne."
                userStat = "Hors Ligne"
            } else {
                StatutTXT = "<:red_circle:715615197246521488> Ne pas déranger."
            }
            userInfoEmbed = new MessageEmbed()
                .setColor('#0066ff')
                .setTitle(`Informations de ${member.user.username}`)
                .addField('User Infos :',
                    `**• Pseudo :** ${member.user.tag}
                        **• ID :** ${member.user.id}
                        **• Date de création :** <t:${Math.round(member.user.createdTimestamp/1000)}:F>
                        **• Bot :** ${botState}
                        **• User flags :** ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Aucun'}
                        **• Peut être banni :** ${banAbText}
                        **• Est mute :** ${Muted}
                        **• Statut :** ${StatutTXT}
                        **• Activité :** ${member.user.bot = false ? "Aucune actvité" : userActivity}
                        **• Booster :** ${boosterState}
                        **• Client :** ${userStat}
                        \u200b`
                )
                .addField('Member Infos :',
                    `**• Role le plus haut :** ${member.roles.highest.id === interaction.guild.id ? 'Aucun' : member.roles.highest.name}
                        **• A Rejoint le :** <t:${Math.round(member.joinedTimestamp/1000)}:F>
                        **• Role affiché :** ${member.roles.hoist ? member.roles.hoist.name : 'Aucun'}
                        **• Tout les roles : [${roles.length}]** ${roles.length < 10 ? roles.join(', ') : roles.length > 10 ? guild.client.trimArray(roles) : 'Aucun'}
                        \u200b`
                )
                .setImage(userAvatar)
                .setTimestamp()
                .setFooter({ text: 'Made by Lack', iconURL: 'https://i.imgur.com/JLhTSlQ.png'});
            interaction.reply({ embeds: [userInfoEmbed] });
        } else if (interaction.options.getSubcommand() === "server") {
            const guild = interaction.guild

            const roles = guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
            const emojis = guild.emojis.cache
            const channels = guild.channels.cache
            let guildAvatar = guild.iconURL({ format: 'jpg', dynamic: true, size: 256 })
            let partnerState = "Non"
            let onlineMembers = guild.members.cache.filter(m => m.presence && m.presence.status !== 'offline').size;
            let premiumLvl = guild.premiumTier
            const { username, discriminator } = await guild.client.users.fetch(guild.ownerId);
            console.log(guild.createdTimestamp);
            if (guild.partnered) partnerState = "Oui"
            const serverInfoEmbed = new MessageEmbed()
                .setColor('#da004e')
                .setTitle('Informations du serveur :')
                .setDescription(`Nom : ${guild.name}`)
                .setThumbnail(guildAvatar)
                .addField('Infos Générales :',
                    `**• Propriétaire : ${username}#${discriminator}**
	        **• Partenaire Discord : ${partnerState}**
	        **• Nombre de boosts : ${guild.premiumSubscriptionCount}**
            **• Boost level : ${premiumLvl}**
            \u200b`
                )
                .addField('Infos de Modération :',
                    `**• Filtres de Contenu Explicite : ${filterLevels[guild.explicitContentFilter]}**
            **• Niveau de Vérification : ${verificationLevels[guild.verificationLevel]}**
            **• Server ID : ${guild.id}**
            **• Date de création : <t:${Math.round(guild.createdTimestamp/1000)}:F>**
            \u200b`
                )
                .addField('Statistiques :',
                    `**• Nombre de roles : ${roles.length}**
            **• Nombre d'Emotes : ${emojis.size}**
            **• Nombre de membres : ${guild.memberCount}**
            **• Membres en ligne : ${onlineMembers}**
            **• Channels Texte : ${channels.filter(channel => channel.type === 'GUILD_TEXT').size}**
            **• Channels Vocaux : ${channels.filter(channel => channel.type === 'GUILD_VOICE').size}**
            \u200b`
                )
                .addField(`Roles [${roles.length - 1}]`, roles.length < 10 ? roles.join(', ') : roles.length > 10 ? guild.client.trimArray(roles).join(', ') : 'None')
                .setTimestamp()
                .setFooter({ text: 'Made by Lack', iconURL: 'https://i.imgur.com/JLhTSlQ.png'});
            interaction.reply({ embeds: [serverInfoEmbed] });
        } else if (interaction.options.getSubcommand() === "client") {
            const core = os.cpus()[0];
            const clientInfoEmbed = new MessageEmbed()
                .setThumbnail(interaction.client.user.avatarURL({ format: 'png', dynamic: true, size: 256 }))
                .setColor(interaction.guild.me.displayHexColor || 'BLUE')
                .addField('Informations du client :',
                    `**• Client :** ${interaction.client.user.tag} (${interaction.client.user.id})
                    **• Commandes :** ${interaction.client.commands.size}
                    **• Serveurs :** ${interaction.client.guilds.cache.size.toLocaleString()}
                    **• Utilisateurs :** ${interaction.client.users.cache.size.toLocaleString()}
                    **• Channels :** ${interaction.client.channels.cache.size.toLocaleString()}
                    **• Date de création :** <t:${Math.round(interaction.client.user.createdTimestamp/1000)}:F>
                    **• NodeJS :** ${process.version}
                    **• Version : ** v${version}
                    **• discord.js :** ${djsversion}
                    **• Développeur :** Lack_off1
                    \u200b`)
                    .addField('Informations système :',
                    `**• Platforme :** ${process.platform}
                    **• Uptime :** ${ms(os.uptime() * 1000, { long: true })}
                    **• CPU :**
                    \u3000 Coeurs : ${os.cpus().length}
                    \u3000 Modèle : ${core.model}
                    \u3000 Vitesse : ${core.speed}MHz
                    **• Mémoire :**
                    \u3000 Total : ${interaction.client.formatBytes(process.memoryUsage().heapTotal)}
                    \u3000 User : ${interaction.client.formatBytes(process.memoryUsage().heapUsed)}`)
                .setTimestamp()
                .setFooter({ text: 'Made by Lack', iconURL: 'https://i.imgur.com/JLhTSlQ.png'});
            interaction.reply({ embeds: [clientInfoEmbed] });      
        }
    },
};