import { Game } from './types/Game';
import DiplomacyService from './diplomacy';

export default class StarContestedService {

    diplomacyService: DiplomacyService;

    constructor(
        diplomacyService: DiplomacyService
    ) {
        this.diplomacyService = diplomacyService;
    }

    listContestedStars(game: Game) {
        return game.galaxy.stars
            .filter(s => s.ownedByPlayerId)
            .map(s => {
                // Calculate other players in orbit of the star
                let carriersInOrbit = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.toString() === s._id.toString());
                let otherPlayerIdsInOrbit = [...new Set(carriersInOrbit.map(c => c.ownedByPlayerId!))];

                if (otherPlayerIdsInOrbit.indexOf(s.ownedByPlayerId!) > -1) {
                    otherPlayerIdsInOrbit.splice(otherPlayerIdsInOrbit.indexOf(s.ownedByPlayerId!), 1); // Remove the star owner as we don't need it here.
                }

                return {
                    star: s,
                    carriersInOrbit,
                    otherPlayerIdsInOrbit
                };
            })
            .filter(x => {
                // Filter stars where there are other players in orbit and those players are not allied with the star owner.
                return x.otherPlayerIdsInOrbit.length
                    && !this.diplomacyService.isDiplomaticStatusToPlayersAllied(game, x.star.ownedByPlayerId!, x.otherPlayerIdsInOrbit);
            });
    }

    listContestedUnownedStars(game: Game) {
        return game.galaxy.stars
            .filter(s => s.ownedByPlayerId == null)
            .map(s => {
                let carriersInOrbit = game.galaxy.carriers.filter(c => c.orbiting && c.orbiting.toString() === s._id.toString());

                return {
                    star: s,
                    carriersInOrbit
                };
            })
            .filter(x => x.carriersInOrbit.length);
    }

}
