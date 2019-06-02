const starNames = require('./db/misc/starNames');
const random = require('./random');

const Star = require('./db/models/schemas/star');

// Default starting values for resources.
const minNaturalResources = 1,
    maxNaturalResources = 50,
    minTerraformResources = 1,
    maxTerraformResources = 50,
    minX = 0,
    minY = 0;

module.exports = {
    starNames: starNames,

    getRandomStarName() {
        return starNames[random.getRandomNumber(starNames.length)];
    },

    getRandomStarNames(count) {
        const list = [];

        do {
            let nextName = module.exports.getRandomStarName();
    
            if (!list.includes(nextName)) {
                list.push(nextName);
            }
        } while (list.length < count);

        return list;
    },

    generateUnownedStar(name, maxX = 1000, maxY = 1000) {
        return {
            name: name,
            naturalResources: random.getWeightedRandomNumberBetween(minNaturalResources, maxNaturalResources),
            terraformedResources: random.getWeightedRandomNumberBetween(minTerraformResources, maxTerraformResources),
            location: {
                x: random.getRandomNumberBetween(minX, maxX),
                y: random.getRandomNumberBetween(minY, maxY)
            }
        };
    }
}