import type {Star} from "../types/common/star";
import type {Player} from "../types/common/player";
import type {Id} from "../types/id";

export class StarDataService {
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
}