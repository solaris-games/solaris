import type {Game as FGame} from "../types/common/game";

// override to handle incomplete games in frontend
type Game<ID> = Pick<FGame<ID>, 'settings'>;

export class GameTypeService {
    isTeamConquestGame<ID>(game: Game<ID>) {
        return game.settings.general.mode === 'teamConquest';
    }

    isNewPlayerGame<ID>(game: Game<ID>) {
        return ['new_player_rt', 'new_player_tb'].includes(game.settings.general.type);
    }

    isTutorialGame<ID>(game: Game<ID>) {
        return game.settings.general.type === 'tutorial';
    }

    isOfficialGame<ID>(game: Game<ID>) {
        return game.settings.general.createdByUserId == null;
    }

    isCustomGame<ID>(game: Game<ID>) {
        return game.settings.general.type === 'custom';
    }

    isFeaturedGame<ID>(game: Game<ID>) {
        return game.settings.general.featured;
    }

    is32PlayerGame<ID>(game: Game<ID>) {
        return game.settings.general.playerLimit === 32;
    }

    isConquestMode<ID>(game: Game<ID>) {
        return game.settings.general.mode === 'conquest';
    }

    isKingOfTheHillMode<ID>(game: Game<ID>) {
        return game.settings.general.mode === 'kingOfTheHill';
    }

    isAnonymousAfterEnd<ID>(game: Game<ID>) {
        return game.settings.general.anonymity === 'extra';
    }

    isAnonymousGameDuringGame<ID>(game: Game<ID>) {
        return game.settings.general.anonymity === 'extra' || game.settings.general.anonymity === 'revealAtEnd';
    }

    isForEstablishedPlayersOnly<ID>(game: Game<ID>) {
        return game.settings.general.playerType === 'establishedPlayers'
    }

    isOrbitalMode<ID>(game: Game<ID>) {
        return game.settings.orbitalMechanics.enabled === 'enabled';
    }

    isBattleRoyaleMode<ID>(game: Game<ID>) {
        return game.settings.general.mode === 'battleRoyale';
    }

    isDarkModeExtra<ID>(game: Game<ID>) {
        return game.settings.specialGalaxy.darkGalaxy === 'extra';
    }

    isDarkMode<ID>(game: Game<ID>) {
        return game.settings.specialGalaxy.darkGalaxy === 'standard'
            || game.settings.specialGalaxy.darkGalaxy === 'extra';
    }

    isDarkFogged<ID>(game: Game<ID>) {
        return game.settings.specialGalaxy.darkGalaxy === 'fog';
    }

    isDarkStart<ID>(game: Game<ID>) {
        return game.settings.specialGalaxy.darkGalaxy === 'start'
            || this.isDarkFogged(game);
    }

    isTurnBasedGame<ID>(game: Game<ID>) {
        return game.settings.gameTime.gameType === 'turnBased';
    }

    isRealTimeGame<ID>(game: Game<ID>) {
        return game.settings.gameTime.gameType === 'realTime';
    }

    isSplitResources<ID>(game: Game<ID>) {
        return game.settings.specialGalaxy.splitResources === 'enabled';
    }

    is1v1Game<ID>(game: Game<ID>) {
        return ['1v1_rt', '1v1_tb'].includes(game.settings.general.type);
    }

    isFluxGame<ID>(game: Game<ID>) {
        return game.settings.general.fluxEnabled === 'enabled'
    }

    isRankedGame<ID>(game: Game<ID>) {
        // Official games are either not user created or featured (featured games can be user created)
        return !this.isTutorialGame(game) &&
                !this.isNewPlayerGame(game) &&
                (!this.isCustomGame(game) || this.isFeaturedGame(game));
    }

    isCapitalStarEliminationMode<ID>(game: Game<ID>) {
        return game.settings.conquest.capitalStarElimination === 'enabled';
    }
}
