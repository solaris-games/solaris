

module.exports = class StarNameService {

    constructor(starNames, randomService) {
        this.starNames = starNames;
        this.randomService = randomService;
    }

    getRandomStarName() {
        return this.starNames[this.randomService.getRandomNumber(this.starNames.length - 1)];
    }

    getRandomStarNames(count) {
        const list = [];

        do {
            let nextName = this.getRandomStarName();
    
            if (!list.includes(nextName)) {
                list.push(nextName);
            }
        } while (list.length < count);

        return list;
    }

};
