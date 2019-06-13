export default {
    getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    },

    getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * max) + min;
    },

    getWeightedRandomNumberBetween(min, max) {
        return Math.round(max / (Math.random() * max + min));
    }
};
