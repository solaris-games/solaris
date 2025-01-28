import {Game} from "./types/Game";
import {Star, StarCaptureResult} from "./types/Star";
import {Player} from "./types/Player";
import {User} from "./types/User";
import {Carrier} from "./types/Carrier";
import GameTypeService from "./gameType";
import PlayerService from "./player";
import StarService from "./star";
import SpecialistService from "./specialist";
import GameStateService from "./gameState";
import DiplomacyService from "./diplomacy";

export default class StarCaptureService {
    specialistService: SpecialistService;
    starService: StarService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    diplomacyService: DiplomacyService;

    constructor(
        specialistService: SpecialistService,
        starService: StarService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        diplomacyService: DiplomacyService,
    ) {
        this.specialistService = specialistService;
        this.starService = starService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.diplomacyService = diplomacyService;
    }

    captureStar(game: Game, star: Star, owner: Player, defenders: Player[], defenderUsers: User[], attackers: Player[], attackerUsers: User[], attackerCarriers: Carrier[]): StarCaptureResult {
        const isTutorialGame = this.gameTypeService.isTutorialGame(game);

        let specialist = this.specialistService.getByIdStar(star.specialistId);

        // If the star had a specialist that destroys infrastructure then perform demolition.
        if (specialist && specialist.modifiers.special && specialist.modifiers.special.destroyInfrastructureOnLoss) {
            star.specialistId = null;
            star.infrastructure.economy = 0;
            star.infrastructure.industry = 0;
            star.infrastructure.science = 0;
            star.warpGate = false;
        }

        // If multiple players are capturing the star, then the player who owns the carrier with the most
        // ships will capture it, otherwise the closest carrier gets it.
        let capturePlayerId = attackerCarriers.sort((a, b) => {
            // Sort by ship count (highest ships first)
            if (a.ships! > b.ships!) return -1;
            if (a.ships! < b.ships!) return 1;

            // Then by distance (closest carrier first)
            return (a.distanceToDestination || 0) - (b.distanceToDestination || 0);
        })[0].ownedByPlayerId!;

        // todo: handle case with multiple hostile attackers
        const attackerPlayers = attackers.filter(p => p._id.toString() !== capturePlayerId.toString());
        const newStarPlayer = attackers.find(p => p._id.toString() === capturePlayerId.toString())!;

        let isAlliedToNewOwner = (player: Player) => false;

        if (this.diplomacyService.isFormalAlliancesEnabled(game)) {
            const newStarPlayerAllies = this.diplomacyService.getAlliesOfPlayer(game, newStarPlayer);
            isAlliedToNewOwner = (player: Player) => newStarPlayerAllies.some(a => a._id.toString() === player._id.toString());
        }

        const hostileAttackersRemaining = attackerPlayers.some(p => !isAlliedToNewOwner(p));

        // Capture the star.
        const newStarUser = attackerUsers.find(u => newStarPlayer.userId && u._id.toString() === newStarPlayer.userId.toString());
        const newStarPlayerCarriers = attackerCarriers.filter(c => c.ownedByPlayerId!.toString() === newStarPlayer._id.toString());

        star.ownedByPlayerId = newStarPlayer._id;
        star.shipsActual = 0;
        star.ships = 0;

        let specialistDestroyed = false;

        if (hostileAttackersRemaining && star.specialistId) {
            const specialist = this.specialistService.getById(star.specialistId, 'star');

            if (!specialist.oneShot) {
                specialistDestroyed = true;
                star.specialistId = null;
            }
        }

        // If star capture reward is enabled, destroy the economic infrastructure
        // and add the capture amount to the attacker
        let captureReward = 0;

        if (game.settings.specialGalaxy.starCaptureReward === 'enabled') {
            captureReward = star.infrastructure.economy! * game.constants.star.captureRewardMultiplier; // Attacker gets X credits for every eco destroyed.

            // Check to see whether to double the capture reward.
            let captureRewardMultiplier = this.specialistService.hasAwardDoubleCaptureRewardSpecialist(newStarPlayerCarriers);

            captureReward = Math.floor(captureReward * captureRewardMultiplier);

            newStarPlayer.credits += captureReward;

            star.infrastructure.economy = 0;
        }

        // Reset the ignore bulk upgrade statuses as it has been captured by a new player.
        this.starService.resetIgnoreBulkUpgradeStatuses(star);

        const oldStarUser = defenderUsers.find(u => owner.userId && u._id.toString() === owner.userId.toString()) || null;

        if (!isTutorialGame) {
            if (oldStarUser && !owner.defeated) {
                oldStarUser.achievements.combat.stars.lost++;

                if (star.homeStar) {
                    oldStarUser.achievements.combat.homeStars.lost++;
                }
            }

            if (newStarUser && !newStarPlayer.defeated) {
                newStarUser.achievements.combat.stars.captured++;

                if (star.homeStar) {
                    newStarUser.achievements.combat.homeStars.captured++;
                }
            }
        }

        if (this.gameTypeService.isKingOfTheHillMode(game) &&
            this.gameStateService.isCountingDownToEndInLastCycle(game) &&
            this.starService.isKingOfTheHillStar(game, star)) {
            this.gameStateService.setCountdownToEndToOneCycle(game);
        }

        return {
            capturedById: newStarPlayer._id,
            capturedByAlias: newStarPlayer.alias!,
            captureReward,
            specialistDestroyed,
        };
    }
}