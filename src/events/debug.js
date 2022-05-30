module.exports = {
    name: 'debug',
    once: false,
    async execute(info) {
        console.log(`[Debug] ${info}`);
    }
};