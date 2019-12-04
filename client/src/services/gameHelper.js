

class GameHelper {

    getUserPlayer(game, userId) {
        return game.galaxy.players.find(p => p.userId === userId)
    }
    
}

export default new GameHelper()
