module.exports = {
    intersectionOfSets(a, b) {
        return new Set(Array.from(a).filter(x => b.has(x)));
    }
}