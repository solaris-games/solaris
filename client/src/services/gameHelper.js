
class GameHelper {
  getUserPlayer (game, userId) {
    return game.galaxy.players.find(p => p.userId === userId)
  }

  getStarOwningPlayer (game, star) {
    return game.galaxy.players.find(x => x._id === star.ownedByPlayerId)
  }
}

export default new GameHelper()
