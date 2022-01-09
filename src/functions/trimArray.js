module.exports = (client) => {
    client.trimArray = (arr, maxLen = 10) => {
        if (arr.length > maxLen) {
            const len = arr.length - maxLen;
            arr = arr.slice(0, maxLen);
            arr.push(`${len} more...`);
        }
        return arr;
    }
}