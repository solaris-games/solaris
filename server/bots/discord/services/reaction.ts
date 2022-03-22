export default class ReactionService {

    thumbsUpDown(msg) {
        this.thumbsUp(msg);
        this.thumbsDown(msg);
    }

    thumbsUp(msg) {
        msg.react('👍');
    }

    thumbsDown(msg) {
        msg.react('👎');
    }

    messageEmojis(msg) {
        const regexMatch = /\p{Emoji_Presentation}/gu;
        let emojiArray = msg.content.match(regexMatch);

        for (let emoji of emojiArray) {
            try {
                msg.react(emoji);
            } catch (error) {
                console.error('One of the emojis failed to react:', error);
            }
        }
    }
}