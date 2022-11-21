const cfg = require('../../cfg.json');
const mysql = require('mysql');

const conn = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: cfg.db_secret,
    database: cfg.db_name
});

const levels = require('./levels.json');

module.exports = (client) => {
    client.shortenText = (ctx, text, maxWidth) => {
        let shorten = false;
        while (ctx.measureText(`${text}...`).width > maxWidth) {
            if (!shorten) shorten = true;
            text = text.substr(0, text.length - 1);
        }
        return shorten ? `${text}...` : text;
    }

    client.shuffle = (array) => {
        const arr = array.slice(0);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    client.streamToArray = (stream) => {
        if (!stream.readable) return Promise.resolve([]);
        return new Promise((resolve, reject) => {
            const array = [];
            function onData(data) {
                array.push(data);
            }
            function onEnd(error) {
                if (error) reject(error);
                else resolve(array);
                cleanup();
            }
            function onClose() {
                resolve(array);
                cleanup();
            }
            function cleanup() {
                stream.removeListener('data', onData);
                stream.removeListener('end', onEnd);
                stream.removeListener('error', onEnd);
                stream.removeListener('close', onClose);
            }
            stream.on('data', onData);
            stream.on('end', onEnd);
            stream.on('error', onEnd);
            stream.on('close', onClose);
        });
    }

    client.drawImageWithTint = (ctx, image, color, x, y, width, height) => {
        const { fillStyle, globalAlpha } = ctx;
        ctx.fillStyle = color;
        ctx.drawImage(image, x, y, width, height);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = fillStyle;
        ctx.globalAlpha = globalAlpha;
    }

    client.formatBytes = (bytes) => {
        if (bytes === 0) return '0Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
    }

    client.formatNumber = (number, fractionDigit = 0) => {
        return Number.parseFloat(number).toLocaleString(undefined, { minimumFractionDigits: fractionDigit, maximumFractionDigits: 2 });
    }

    client.cleanTxt = (text) => {
        if (typeof text === 'string') {
            text = text
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`)
                .replace(new RegExp(cfg.token, 'gi'), '****')
        }
        return text
    }

    client.removeDuplicates = (arr) => {
        return [...new Set(arr)];
    }

    client.capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //Leveling System with MySQL
    client.createUser = (guildId, userId, xp, level = 0) => {
        return new Promise((resolve, reject) => {
            conn.query(`INSERT INTO xp (guild_id, user_id, xp, level) VALUES (?, ?, ?, ?)`, [guildId, userId, xp, level], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    client.addExp = async (message) => {
        const { id } = message.author;
        const { id: guildId } = message.guild;
        let xp = Math.floor(Math.random() * 10) + 15;

        if (message.attachments.size > 0) {
            xp += 20;
        }

        if (message.content.length > 150) {
            xp += 10;
        } else if (message.content.length < 5) {
            xp = 0;
        }

        if (message.member.premiumSinceTimestamp) {
            xp += 10;
        }

        console.log(xp);

        conn.query(`SELECT * FROM XP WHERE user_id = '${id}' AND guild_id = '${guildId}'`, async (err, rows) => {  
            if (err) throw err;
            if (rows.length < 1) {
                await client.createUser(guildId, id, xp);
            } else {
                const curExp = rows[0].xp;
                conn.query(`UPDATE XP SET xp = ${curExp + xp} WHERE user_id = '${id}' AND guild_id = '${guildId}'`);
            }
            client.levelUp(message);
        });
    }

    client.levelUp = (message) => {
        const { id } = message.author;
        const { id: guildId } = message.guild;

        console.log(id, guildId);

        conn.query(`SELECT * FROM XP WHERE user_id = '${id}' AND guild_id = '${guildId}'`, (err, rows) => {
            if (err) throw err;
            const curLevel = rows[0].level;
            const curExp = rows[0].xp;
            const nxtLevel = curLevel + 1;
            const nxtLevelExp = levels.levels[nxtLevel].xp;

            if (curExp >= nxtLevelExp) {
                conn.query(`UPDATE XP SET level = ${nxtLevel} WHERE user_id = '${id}' AND guild_id = '${guildId}'`);
                message.channel.send(`Congrats ${message.author}! You have leveled up to level ${nxtLevel}`);
            }
        });
    }

    client.getLevel = (guildId, userId) => {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM XP WHERE user_id = '${userId}' AND guild_id = '${guildId}'`, (err, rows) => {
                if (err) reject(err);
                if (rows.length < 1) resolve(0);
                else resolve(rows[0].level);
            });
        });
    }

    client.getExp = (guildId, userId) => {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM XP WHERE user_id = '${userId}' AND guild_id = '${guildId}'`, (err, rows) => {
                if (err) reject(err);
                if (rows.length < 1) resolve(0);
                else resolve(rows[0].xp);
            });
        });
    }

    client.getLeaderboard = (guildId, userId) => {
        return new Promise((resolve, reject) => {
            // get the 3 first users with the highest xp then add the user rank and the top and bottom 1 users 
            let finalArray_1 = [];
            let finalArray_2 = [];
            conn.query(`SELECT * FROM XP WHERE guild_id = '${guildId}' ORDER BY xp DESC LIMIT 3`, (err, rows) => {
                if (err) reject(err);
                if (rows.length < 1) resolve(0);
                else {
                    finalArray_1 = rows;
                    conn.query(`SELECT * FROM XP WHERE guild_id = '${guildId}' ORDER BY xp DESC`, (err, rows) => {
                        if (err) reject(err);
                        if (rows.length < 1) resolve(0);
                        else {
                            let userRank = rows.findIndex((row) => row.user_id === userId) + 1;
                            if (userRank != 1) finalArray_2.push(rows[userRank - 2]);
                            finalArray_2.push({ user_id: userId, xp: rows[userRank - 1].xp, level: rows[userRank - 1].level, rank: userRank });
                            finalArray_2.push(rows[userRank]);
                            if (userRank == 1) finalArray_2.push(rows[userRank + 1]);
                            resolve([finalArray_1, finalArray_2]);
                        }
                    });
                }
            });
        });
    }

    client.getRank = (guildId, userId) => {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM XP WHERE guild_id = '${guildId}' ORDER BY xp DESC`, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.findIndex(row => row.user_id === userId) + 1);
            });
        });
    }

    client.getLastRankNumber = (guildId) => {
        return new Promise((resolve, reject) => {
            conn.query(`SELECT * FROM XP WHERE guild_id = '${guildId}' ORDER BY xp DESC`, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.length);
            });
        });
    }

    client.getXpToNextLevel = (guildId, userId) => {
        return new Promise(async (resolve, reject) => {
            const curLevel = await client.getLevel(guildId, userId);
            const curExp = await client.getExp(guildId, userId);
            const nxtLevel = curLevel + 1;
            const nxtLevelExp = levels.levels[nxtLevel].xp;
            resolve(nxtLevelExp - curExp);
        });
    }

    client.giveExp = (guildId, userId, xp) => {
        return new Promise(async (resolve, reject) => {
            const curExp = await client.getExp(guildId, userId);
            let level = await client.getLevelFromExp(curExp + xp);
            conn.query(`UPDATE XP SET xp = ${curExp + xp}, level = ${level} WHERE user_id = '${userId}' AND guild_id = '${guildId}'`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    client.removeExp = (guildId, userId, xp) => {
        return new Promise(async (resolve, reject) => {
            const curExp = await client.getExp(guildId, userId);
            let level = await client.getLevelFromExp(curExp - xp);
            conn.query(`UPDATE XP SET xp = ${curExp - xp}, level = ${level} WHERE user_id = '${userId}' AND guild_id = '${guildId}'`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    client.setExp = (guildId, userId, xp) => {
        return new Promise(async (resolve, reject) => {
            let level = await client.getLevelFromExp(xp);
            conn.query(`UPDATE XP SET xp = ${xp}, level = ${level} WHERE user_id = '${userId}' AND guild_id = '${guildId}'`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    client.getLevelFromExp = (exp) => {
        let level = 1;
        while (exp >= levels.levels[level].xp) {
            level++;
        }
        return level;
    }
}