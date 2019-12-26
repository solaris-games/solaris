module.exports = {

    calculateStarShipsByTicks(techLevel, industryLevel, ticks = 1) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return (industryLevel * (techLevel + 5) / 24) * ticks;
    },

};
