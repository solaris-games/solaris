class DiplomacyHelper {
  
  isFormalAlliancesEnabled (game) {
    return game.settings.diplomacy.enabled === 'enabled'
  }

  isTradeRestricted (game) {
    return game.settings.diplomacy.tradeRestricted === 'enabled'
  }

  maxAlliances (game) {
    return game.settings.diplomacy.maxAlliances
  }

  isMaxAlliancesEnabled (game) {
    return game.settings.diplomacy.maxAlliances < game.settings.general.playerLimit - 1
  }

  isAllianceUpkeepEnabled (game) {
    return game.settings.diplomacy.upkeepCost !== 'none'
  }

  getAllianceUpkeepCost (game, player, cycleCredits, allianceCount) {
    const costPerAlly = game.constants.diplomacy.upkeepExpenseMultipliers[game.settings.diplomacy.upkeepCost];
    const upkeep = Math.round(allianceCount * costPerAlly * cycleCredits)

    return upkeep
  }

  isDiplomaticStatusToPlayersAllied(game, playerId, toPlayerIds) {
    let playerIdA = playerId;

    for (let i = 0; i < toPlayerIds.length; i++) {
        let playerIdB = toPlayerIds[i]

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerIdA, playerIdB)

        if (['enemies', 'neutral'].includes(diplomaticStatus.actualStatus)) {
            return false
        }
    }

    return true
  }

  getDiplomaticStatusToPlayer(game, playerIdA, playerIdB) {
    if (playerIdA.toString() === playerIdB.toString()) {
      return {
          playerIdFrom: playerIdA,
          playerIdTo: playerIdB,
          statusFrom: 'allies',
          statusTo: 'allies',
          actualStatus: 'allies'
      }
    }

    let playerA = game.galaxy.players.find(p => p._id.toString() === playerIdA.toString())
    let playerB = game.galaxy.players.find(p => p._id.toString() === playerIdB.toString())

    let playerADiplo = playerA.diplomacy.find(x => x.playerId.toString() === playerB._id.toString())
    let playerBDiplo = playerB.diplomacy.find(x => x.playerId.toString() === playerA._id.toString())

    let statusTo = playerADiplo == null ? 'neutral' : playerADiplo.status
    let statusFrom = playerBDiplo == null ? 'neutral' : playerBDiplo.status

    let actualStatus

    if (statusTo === 'enemies' || statusFrom === 'enemies') {
        actualStatus = 'enemies'
    } else if (statusTo === 'neutral' || statusFrom === 'neutral') {
        actualStatus = 'neutral'
    } else {
        actualStatus = 'allies'
    }

    return {
        playerIdFrom: playerIdA,
        playerIdTo: playerIdB,
        statusFrom,
        statusTo,
        actualStatus
    }
  }

}

export default new DiplomacyHelper()
