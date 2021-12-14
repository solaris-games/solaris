module.exports = class BotHelperService {

    constructor(botResponseService) {
        this.botResponseService = botResponseService;
    }

    isValidID(id) {
        // Splitting up the id and figuring out what characters an ID may consist of
        let characters = id.split('');
        const allowedCharacters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

        // Checking if the id actually consists of all the allowed characters
        let validCharacters = characters.reduce((preVal, curVal) => preVal && allowedCharacters.includes(curVal), true);

        // Returning whether or not the characters are all allowed and whether the id has the right length
        return validCharacters && id.length === 24;
    }

    async getNestedObject(nestedObj, pathArr) {
        // Here be dragons
        // This function gets data out of an object, where we know the path we have to take to get to the data
        return pathArr.reduce((obj, key) =>
            (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
    }

    async PCorMobile(botMessage, userMessage, responseFunction, responseData) {
        // This function allows a user to switch between a mobile and a PC format for the bot response, as some bot responses may not look well on phone or PC
        let isPC = true;

        // Reacting with the emojis required to use the PCorMobile function
        try {
            botMessage.react('📱');
        } catch (error) {
            console.log('One of the emojis failed to react:', error);
        }

        // Creating a collector that checks if the right person (the one that sent the command) responds with any of the right emojis
        const collector = botMessage.createReactionCollector(
            (reaction, user) => (reaction.emoji.name === '📱') && (user.id === userMessage.author.id), { time: 60000 }
        )

        // Activating the collector
        collector.on('collect', () => {
            // First thing to do when the right emoji is added is to remove all emojis that have been used
            botMessage.reactions.removeAll().then(async () => {
                // We know that the collector is only triggered when the user responded with 📱, so we can switch the isPC
                isPC = !isPC;
                responseData.isPC = isPC;

                // Generating a response and editing the previously sent message from the bot with that response
                let editedResponse = await responseFunction(responseData);
                botMessage.edit(editedResponse);

                // Reacting with the emojis again to make sure the user can use this system again
                try {
                    botMessage.react('📱');
                } catch (error) {
                    console.log('One of the emojis failed to react:', error);
                }
            })
        });
    }

    async multiPage(botMessage, userMessage, pageCount, looping, responseFunction, responseData, checkPC = true /*A variable as long as not all functions have a mobile version*/) {
        // This function makes a response that has multiple pages, where the user can move between pages by adding the proper response
        let pageNumber = responseData.page || 0;
        let isPC = true;

        // Reacting with the emojis required to use the multiPage
        await this.reactPagesMobile(botMessage, looping, pageNumber, pageCount, checkPC);

        // Figuring out which emojis are accepted by the current settings
        let emojiArray = looping ? ['⬅️', '➡️'] : ['⏪', '⬅️', '➡️', '⏩'];
        if (checkPC) emojiArray.push('📱');

        // Creating a collector that checks if the right person (the one that sent the command) responds with any of the right emojis
        const collector = botMessage.createReactionCollector(
            (reaction, user) => emojiArray.includes(reaction.emoji.name) && user.id === userMessage.author.id, { time: 60000 }
        )

        // Activating the collector
        collector.on('collect', (reaction) => {
            // First thing to do when the right emoji is added is to remove all emojis that have been used
            botMessage.reactions.removeAll().then(async () => {
                // Checking what has to happen with the current page/isPC variable now that the emoji has been sent
                switch (reaction.emoji.name) {
                    case '⏪':
                        if (!looping) pageNumber -= 5;
                        break;
                    case '⬅️':
                        pageNumber -= 1;
                        break;
                    case '➡️':
                        pageNumber += 1;
                        break;
                    case '⏩':
                        if (!looping) pageNumber += 5;
                        break;
                    case '📱':
                        if (checkPC) isPC = !isPC;
                        break;
                    default:
                        console.log('Something broke, unidentified caught emoji...')
                }

                // Making sure that pages never go in the negatives, because when that happens, the page either has to be 0, or has to loop around to the end
                if (pageNumber < 0) {
                    if (looping) {
                        pageNumber = pageCount - pageNumber % pageCount; //When it loops around, page -1 is the same as the last page, which is pageCount - 1
                    } else {
                        pageNumber = 0; //When it doesn't loop around, any page lower than the 0 page is the 0 page.
                    }
                } else if (pageNumber >= pageCount) {
                    if (looping) {
                        pageNumber = pageNumber % pageCount // When it loops around, the page with index pageCount is the same as the one with index 0.
                    } else {
                        pageNumber = pageCount - 1; // When it doesn't loop around, any page above the maximum is just the maximum page.
                    }
                }

                // Updating the responseData
                responseData.isPC = isPC;
                responseData.page = pageNumber;

                // Generating a response and editing the previously sent message from the bot with that response
                let editedResponse = await responseFunction(responseData)
                botMessage.edit(editedResponse)

                // Reacting with the emojis again to make sure the user can use this system again
                await this.reactPagesMobile(botMessage, looping, pageNumber, pageCount, checkPC);
            })
        })
    }

    async reactPagesMobile(botMessage, looping, pageNumber, pageCount, mobileCheck) {
        // A function meant to react with the right emojis when the multiPage function is called
        try {
            if (!looping && pageNumber > 1) await botMessage.react('⏪');
            if (looping || pageNumber > 0) await botMessage.react('⬅️');
            if (looping || pageNumber < pageCount - 1) await botMessage.react('➡️');
            if (!looping && pageNumber < pageCount - 2) await botMessage.react('⏩');
            if (mobileCheck) await botMessage.react('📱');
        } catch (error) {
            console.log('One of the emojis failed to react:', error);
        }
    }
}