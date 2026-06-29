class RandomHelper {
  // Note that the max is INCLUSIVE
  getRandomNumberBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

export default new RandomHelper();
