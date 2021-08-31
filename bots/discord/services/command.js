module.exports = class CommandService {

    isCommand(msg, prefix) {
        return msg.content.startsWith(prefix);
    }

    isBot(msg) {
        return msg.author.bot;
    }

    isCorrectChannel(msg, cmd) {
        return ((cmd === 'invite') && (msg.channel.id === process.env.CHAT_ID_LOOKING_TO_PLAY)) || ((cmd !== 'invite') && (msg.channel.id === process.env.CHAT_ID_BOTS));
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
