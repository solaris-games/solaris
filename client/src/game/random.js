export default {
    getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    },

    getRandomNumberBetween(min, max) {
        return Math.floor(Math.random() * max) + min;
    },

};
