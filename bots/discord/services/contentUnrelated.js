module.exports = class ContentUnrelatedService {

    constructor() {

    }

    suggestions(msg, channelArray) {
        console.log(2)
        if (channelArray.includes(msg.channel.id)) {
            botResponseService.reactThumbsUp(msg);
            botResponseService.reactThumbsDown(msg);
        };
    }

    polls(msg, channelID) {
        console.log(msg.channel.id)
        console.log(channelID)
        if(msg.channel.id === channelID) {
            console.log(3)
            const regexMatch = /\p{Emoji_Presentation}/gu
            let emojiArray = msg.content.match(regexMatch)
            for(let emoji of emojiArray) {
                try {
                    msg.react(emoji);
                } catch (error) {
                    console.log('One of the emojis failed to react:', error);
                }
            }
        }
    }
}