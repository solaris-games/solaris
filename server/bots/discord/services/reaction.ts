export default class ReactionService {

    thumbsUpDown(msg: any) {
        this.thumbsUp(msg);
        this.thumbsDown(msg);
    }

    thumbsUp(msg: any) {
        msg.react('👍');
    }

    thumbsDown(msg: any) {
        msg.react('👎');
    }

    messageEmojis(msg: any) {
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