

module.exports = class CommandService {

    constructor() {

    }

    isCommand(msg, prefix) {
        return msg.content.startsWith(prefix);
    }

    isBot(msg) {
        return msg.author.bot;
    }

    identify(msg) {
        //Splitting the command into the different parts, the command and directions. After that checking if the command exists
        const cmd = directions[0];
        directions.shift();

        return {
            directions: msg.content.slice(prefix.length).split(' '),
            cmd,
            type: msg.channel.type
        };
    }

    reactThumbsUp(msg) {
        msg.react('👍');
    }

    reactThumbsDown(msg) {
        msg.react('👎');
    }
};
