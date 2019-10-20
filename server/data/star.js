const mongoose = require('mongoose');
const starNames = require('./db/misc/starNames');
const random = require('./random');

const Star = require('./db/models/schemas/star');

module.exports = {
    DEFAULTS: {
        MIN_NATURAL_RESOURCES: 10,
        MAX_NATURAL_RESOURCES: 50
    },

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

    generateUnownedStar(name, maxRadius = 1000) {
        return {
            _id: mongoose.Types.ObjectId(),
            name: name,
            naturalResources: random.getRandomNumberBetween(module.exports.DEFAULTS.MIN_NATURAL_RESOURCES, module.exports.DEFAULTS.MAX_NATURAL_RESOURCES),
            terraformedResources: 0, // TODO: This is calculated based on the player's tech level.
            location: random.getRandomPositionInCircle(maxRadius)
        };
    },

    calculateTerraformedResources(naturalResources, terraforming) {
        return (terraforming * 5) + naturalResources;
    }

}