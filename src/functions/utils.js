const cfg = require('../../cfg.json');

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
}