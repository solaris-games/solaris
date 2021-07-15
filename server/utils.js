module.exports = {
    intersectionOfSets(a, b) {
        return new Set(Array.from(a).filter(x => b.has(x)));
    },
    maxBy (max, list) {
        let lastScore = Number.MIN_SAFE_INTEGER;
        for (let el of list) {
            const elScore = max(el);
            if (elScore > lastScore) {
                lastScore = elScore;
            }
        }

        return lastScore;
    },
    minBy (min, list) {
        let lastScore = Number.MAX_SAFE_INTEGER;
        for (let el of list) {
            const elScore = min(el);
            if (elScore < lastScore) {
                lastScore = elScore;
            }
        }

        return lastScore;
    },
    minElementBy (min, list) {
        let lastScore = Number.MAX_SAFE_INTEGER;
        let minEl = undefined;
        for (let el of list) {
            const elScore = min(el);
            if (elScore < lastScore) {
                lastScore = elScore;
                minEl = el;
            }
        }

        return minEl;
    }
}