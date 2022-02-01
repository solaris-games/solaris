export default class GameTypeService {

    isNewPlayerGame(game) {
        return ['new_player_rt', 'new_player_tb'].includes(game.settings.general.type);
    }

    isTutorialGame(game) {
        return game.settings.general.type === 'tutorial';
    }

    isCustomGame(game) {
        return game.settings.general.type === 'custom';
    }

    isFeaturedGame(game) {
        return game.settings.general.featured;
    }

    isSpecialGameMode(game) {
        return [
            'special_dark',
            'special_ultraDark',
            'special_orbital',
            'special_battleRoyale',
            'special_homeStar',
            'special_anonymous',
            'special_kingOfTheHill',
            'special_tinyGalaxy'
        ].includes(game.settings.general.type);
    }

    isConquestMode(game) {
        return game.settings.general.mode === 'conquest';
    }

    isKingOfTheHillMode(game) {
        return game.settings.general.mode === 'kingOfTheHill';
    }

    isAnonymousGame(game) {
        return game.settings.general.anonymity === 'extra';
    }

    isForEstablishedPlayersOnly(game) {
        return game.settings.general.playerType === 'establishedPlayers'
    }

    isOrbitalMode(game) {
        return game.settings.orbitalMechanics.enabled === 'enabled';
    }

    isBattleRoyaleMode(game) {
        return game.settings.general.mode === 'battleRoyale';
    }

    isDarkModeExtra(game) {
        return game.settings.specialGalaxy.darkGalaxy === 'extra';
    }

    isDarkMode(game) {
        return game.settings.specialGalaxy.darkGalaxy === 'standard'
            || game.settings.specialGalaxy.darkGalaxy === 'extra';
    }

    isDarkStart(game) {
        return game.settings.specialGalaxy.darkGalaxy === 'start';
    }

    isTurnBasedGame(game) {
        return game.settings.gameTime.gameType === 'turnBased';
    }

    isRealTimeGame(game) {
        return game.settings.gameTime.gameType === 'realTime';
    }

    isSplitResources(game) {
        return game.settings.specialGalaxy.splitResources === 'enabled';
    }

}
