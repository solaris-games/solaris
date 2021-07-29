

module.exports = class CommandService {

    constructor() {

    }

    isCommand(msg, prefix) {
        return msg.content.startsWith(prefix);
    }

    isBot(msg) {
        return msg.author.bot;
    }

    identify(msg, prefix) {
        const directions = msg.content.slice(prefix.length).split(/\s+/);
        const cmd = directions[0];
        directions.shift();

        return {
            directions,
            cmd,
            type: msg.channel.type
        };
    }
};
