export default class CommandService {

    isCommand(msg, prefix: string) {
        return msg.content.startsWith(prefix);
    }

    isBot(msg) {
        return msg.author.bot;
    }

    isCorrectChannel(msg, cmd: string) {
        const channelArray = [
            process.env.CHAT_ID_BOTS,
            process.env.CHAT_ID_ACTIVE_GAMES,
            process.env.CHAT_ID_GUILD_CHAT,
            process.env.CHAT_ID_TOURNAMENTS
        ];
        if (cmd === 'invite') {
            return msg.channel.id === process.env.CHAT_ID_LOOKING_TO_PLAY;
        }
        return channelArray.includes(msg.channel.id);
    }

    identify(msg, prefix: string) {
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
