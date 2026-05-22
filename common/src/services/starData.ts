import type {Star} from "../types/common/star";
import type {Player} from "../types/common/player";
import type {Id} from "../types/id";
import {GameTypeService} from "./gameType";
import type {Game} from "../types/common/game";

export class StarDataService {
    gameTypeService: GameTypeService;

    constructor(gameTypeService: GameTypeService) {
        this.gameTypeService = gameTypeService;
    }

    isStarPairWormHole<ID extends Id>(sourceStar: Star<ID>, destinationStar: Star<ID>) {
        return sourceStar
            && destinationStar
            && sourceStar.wormHoleToStarId
            && destinationStar.wormHoleToStarId
            && sourceStar.wormHoleToStarId.toString() === destinationStar._id.toString()
            && destinationStar.wormHoleToStarId.toString() === sourceStar._id.toString();
    }

    isOwnedByPlayer<ID extends Id>(star: Star<ID>, player: Player<ID>) {
        return star.ownedByPlayerId && star.ownedByPlayerId.toString() === player._id.toString();
    }

    isDeadStar<ID>(star: Star<ID>) {
        if (!star.naturalResources) {
            return true;
        }

        return star.naturalResources.economy <= 0 && star.naturalResources.industry <= 0 && star.naturalResources.science <= 0;
    }

    isCapitalCaptureCapital<ID>(game: Game<ID>, star: Star<ID>) {
        if (!star.homeStar || !star.ownedByPlayerId) {
            return false;
        }

        return this.gameTypeService.isConquestMode(game) && game.settings.conquest.victoryCondition === 'homeStarPercentage';
    }

    isOwnerCapital<ID extends Id>(game: Game<ID>, star: Star<ID>) {
        if (!star.homeStar || !star.ownedByPlayerId) {
            return false;
        }

        const ownersHomeStarId = game.galaxy.players.find(p => p._id.toString() === star.ownedByPlayerId!.toString())!.homeStarId;

        return ownersHomeStarId && ownersHomeStarId.toString() === star._id.toString();
    }

    isCapitalEliminationCapital<ID extends Id>(game: Game<ID>, star: Star<ID>) {
        if (!star.homeStar || !star.ownedByPlayerId) {
            return false;
        }

        const player = game.galaxy.players.find(p => p._id.toString() === star.ownedByPlayerId!.toString());
        if (!player) {
            return false;
        }

        if (this.gameTypeService.isCapitalStarEliminationMode(game) && this.isOwnerCapital(game, star) && !player.defeated) {
            return true;
        }

        return false;
    }
}