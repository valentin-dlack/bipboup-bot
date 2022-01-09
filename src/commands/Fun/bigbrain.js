const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('bigbrain')
        .setDescription(`it's big brain time`),

    async execute(interaction) {
        let bIndex = Math.floor((Math.random() * 6));
        let responses_list = [
            `https://media1.tenor.com/images/7832984438e52f16333c913747530ecb/tenor.gif?itemid=14807319`,
            `https://media1.tenor.com/images/36049108b353a99fd9f57be101154773/tenor.gif?itemid=15261893`,
            `https://media1.tenor.com/images/8ac74d59bf920c9588c8f7f00229cb78/tenor.gif?itemid=14835823`,
            `https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRNgDykkl8lKajWRJtAozAgor-FODdpmU_wCn6vGvOOf0m0gFDy&usqp=CAU`,
            `https://i.ytimg.com/vi/3TjdlKbyHD8/maxresdefault.jpg`,
            `NOPE ! It's smoooooooooooool brain !!!!\nhttps://i.ytimg.com/vi/mS_ii4N5ESE/maxresdefault.jpg`
        ]
        interaction.reply(`${responses_list[bIndex]}`)
    }
}