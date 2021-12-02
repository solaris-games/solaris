module.exports = class BotHelperService {

    constructor(botResponseService) {
        this.botResponseService = botResponseService;
    }

    async getNestedObject(nestedObj, pathArr) {
        return pathArr.reduce((obj, key) =>
            (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
    }

    async PCorMobile(botMessage, userMessage, responseFunction, responseData) {
        let isPC = true;
        try {
            botMessage.react('📱');
        } catch (error) {
            console.log('One of the emojis failed to react:', error);
        }

        const collector = botMessage.createReactionCollector(
            (reaction, user) => (reaction.emoji.name === '📱') && (user.id === userMessage.author.id), { time: 60000 }
        )

        collector.on('collect', () => {
            botMessage.reactions.removeAll()
            .then(async () => {
                isPC = !isPC;
                responseData.isPC = isPC;
                let editedResponse = await responseFunction(responseData);
                botMessage.edit(editedResponse);

                try {
                    botMessage.react('📱');
                } catch (error) {
                    console.log('One of the emojis failed to react:', error);
                }
            })
        });
    }

    async multiPage(botMessage, userMessage, pageCount, looping, responseFunction, responseData, checkPC = true /*A variable as long as not all functions have a mobile version*/) {
        let pageNumber = 0;
        let isPC = true;
        await this.reactPagesMobile(botMessage, looping, pageNumber, pageCount, checkPC);

        let emojiArray = looping ? ['⬅️', '➡️'] : ['⏪', '⬅️', '➡️', '⏩'];
        if(checkPC) emojiArray.push('📱')

        const collector = botMessage.createReactionCollector(
            (reaction, user) => emojiArray.includes(reaction.emoji.name) && user.id === userMessage.author.id, {time: 60000}
        )

        collector.on('collect', (reaction) => {
            botMessage.reactions.removeAll().then(async () => {
                switch(reaction.emoji.name) {
                    case '⏪':
                        if(!looping) pageNumber -= 5;
                        break;
                    case '⬅️':
                        pageNumber -= 1;
                        break;
                    case '➡️':
                        pageNumber += 1;
                        break;
                    case '⏩':
                        if(!looping) pageNumber += 5;
                        break;
                    case '📱':
                        if(checkPC) isPC = !isPC;
                        break;
                    default:
                        console.log('Something broke, unidentified caught emoji...')
                }

                if(pageNumber < 0) {
                    if(looping) {
                        pageNumber = pageCount - pageNumber; //When it loops around, page -1 is the same as the last page, which is pageCount - 1
                    } else {
                        pageNumber = 0; //When it doesn't loop around, any page lower than the 0 page is the 0 page.
                    }
                } else if(pageNumber >= pageCount) {
                    if(looping) {
                        pageNumber = pageNumber%pageCount // When it loops around, the page with index pageCount is the same as the one with index 0.
                    } else {
                        pageNumber = pageNumber - 1; // When it doesn't loop around, any page above the maximum is just the maximum page.
                    }
                }

                responseData.isPC = isPC;
                responseData.page = pageNumber;
                let editedResponse = await responseFunction(responseData) //TODO Fix and complete
                botMessage.edit(editedResponse)

                await this.reactPagesMobile(botMessage, looping, pageNumber, pageCount, checkPC);
            })
        })
    }

    async reactPagesMobile(botMessage, looping, pageNumber, pageCount, mobileCheck) {
        try {
            if(!looping && pageNumber > 1) await botMessage.react('⏪');
            if(looping || pageNumber > 0) await botMessage.react('⬅️');
            if(looping || pageNumber < pageCount - 1) await botMessage.react('➡️');
            if(!looping && pageNumber < pageCount - 2) await botMessage.react('⏩');
            if(mobileCheck) await botMessage.react('📱');
        } catch (error) {
            console.log('One of the emojis failed to react:', error);
        }
    }
}