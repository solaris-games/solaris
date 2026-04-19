import {Game} from "./types/Game";
import {Player} from "./types/Player";
import {User} from "./types/User";
import {
    Carrier, CombatResult,
    CombatService,
    GameTypeService, GroupedCombatResult,
    notUndefined,
    Star,
    StarCaptureResult
} from '@solaris/common'
import EventEmitter from "events";
import {DBObjectId} from "./types/DBObjectId";
import StarCaptureService from "./starCapture";
import ReputationService from "./reputation";
import PlayerService from "./player";

export const CombatServiceEvents = {
    onPlayerCombatStar: 'onPlayerCombatStar',
    onPlayerCombatCarrier: 'onPlayerCombatCarrier'
}

export default class CombatProcessingService extends EventEmitter {
    combatService: CombatService<DBObjectId>;
    gameTypeService: GameTypeService;
    starCaptureService: StarCaptureService;
    reputationService: ReputationService;
    playerService: PlayerService;

    constructor(
        combatService: CombatService<DBObjectId>,
        gameTypeService: GameTypeService,
        starCaptureService: StarCaptureService,
        reputationService: ReputationService,
        playerService: PlayerService,
    ) {
        super();

        this.gameTypeService = gameTypeService;
        this.combatService = combatService;
        this.starCaptureService = starCaptureService;
        this.reputationService = reputationService;
        this.playerService = playerService;
    }

    _distributeDamage(combatResult: CombatResult<DBObjectId>) {
        for (let group of combatResult.groups) {
            if (group.star) {
                const star = group.star.star;

                star.shipsActual! = Math.max(0, group.star.shipsAfter);
            }

            for (let carrierRes of group.carriers) {
                const carrier = carrierRes.carrier;

                carrier.ships = Math.max(0, carrierRes.shipsAfter);
            }
        }
    }

    async performCombat(game: Game, gameUsers: User[], defender: Player, star: Star<DBObjectId> | null, carriers: Carrier<DBObjectId>[]) {
        let combatResult: CombatResult<DBObjectId>;
        if (star) {
            combatResult = this.combatService.computeStar(game, star, carriers);
        } else {
            combatResult = this.combatService.computeCarrier(game, carriers);
        }

        // Distribute damage evenly across all objects that are involved in combat.
        this._distributeDamage(combatResult);

        if (!this.gameTypeService.isTutorialGame(game)) {
            this._updatePlayersCombatAchievements(game, gameUsers, combatResult);
        }

        // Remove any carriers from the game that have been destroyed.
        const destroyedCarriers = game.galaxy.carriers.filter(c => !c.ships || Math.floor(c.ships) === 0);

        for (let carrier of destroyedCarriers) {
            game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(carrier), 1);
        }

        let captureResult: StarCaptureResult<DBObjectId> | null = null;

        if (star) {
            captureResult = this._starDefeatedCheck(game, star, combatResult, gameUsers);
        }

        await this._deductReputation(game, combatResult);

        // Log the combat event
        if (star) {
            this.emit(CombatServiceEvents.onPlayerCombatStar, {
                gameId: game._id,
                gameTick: game.state.tick,
                owner: defender,
                star,
                combatResult,
                captureResult
            });
        } else {
            this.emit(CombatServiceEvents.onPlayerCombatCarrier, {
                gameId: game._id,
                gameTick: game.state.tick,
                combatResult
            });
        }

        return combatResult;
    }

    async _deductReputation(game: Game, combatResult: CombatResult<DBObjectId>) {
        const defenderGroup = combatResult.groups.find((g) => Boolean(g.star));

        if (defenderGroup) {
            const attackerPlayers = combatResult.groups.flatMap(g => {
                if (g !== defenderGroup) {
                    return g.players;
                } else {
                    return [];
                }
            });

            for (const defender of defenderGroup.players) {
                for (const attacker of attackerPlayers) {
                    await this.reputationService.decreaseReputation(game, defender, attacker, false);
                    await this.reputationService.decreaseReputation(game, attacker, defender, false);
                }
            }
        }
    }

    _findUser(gameUsers: User[], player: Player) {
        return gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString());
    }

    _starDefeatedCheck(game: Game, star: Star<DBObjectId>, combatResult: CombatResult<DBObjectId>, gameUsers: User[]) {
        const defenderGroup = combatResult.groups.find((g) => Boolean(g.star))!;

        const starDead = star && !Math.floor(star.shipsActual!);
        const carriersDead = defenderGroup.carriers.every(c => Math.floor(c.carrier.ships || 0) === 0);

        const starDefenderDefeated = starDead && carriersDead;

        const lastAliveGroup = combatResult.groups.find(g => g !== defenderGroup && g.shipsAfter > 0);

        if (starDefenderDefeated && lastAliveGroup) {
            const owner = this.playerService.getById(game, star.ownedByPlayerId!)!;
            const ownerUser = this._findUser(gameUsers, owner);
            const attackerUsers = lastAliveGroup.players.map(p => this._findUser(gameUsers, p)).filter(notUndefined);
            return this.starCaptureService.captureStar(game, star, owner, ownerUser, lastAliveGroup.players, attackerUsers, lastAliveGroup.carriers.map(r => r.carrier));
        }

        return null;
    }

    _updatePlayersCombatAchievements(game: Game, gameUsers: User[], combatResult: CombatResult<DBObjectId>) {
        // TODO

        /*

        let defenderCarriersDestroyed = defenderCarriers.filter(c => !c.ships).length;
        let defenderSpecialistsDestroyed = defenderCarriers.filter(c => !c.ships && c.specialistId).length;

        let attackerCarriersDestroyed = attackerCarriers.filter(c => !c.ships).length;
        let attackerSpecialistsDestroyed = attackerCarriers.filter(c => !c.ships && c.specialistId).length;

        // Add combat result stats to defender achievements.
        for (let defenderUser of defenderUsers) {
            let defender = defenders.find(u => u.userId && u.userId.toString() === defenderUser._id.toString())!;

            if (defender && !defender.defeated) {
                const playerCarriers = defenderCarriers.filter(c => c.ownedByPlayerId!.toString() === defender._id.toString());

                this.statisticsService.modifyStats(game._id, defender._id, (stats) => {
                    stats.combat.kills.ships += combatResult.lost.attacker;
                    stats.combat.kills.carriers += attackerCarriersDestroyed;
                    stats.combat.kills.specialists += attackerSpecialistsDestroyed;

                    stats.combat.losses.ships += combatResult.lost.defender; // TODO: This will not be correct in combat where its more than 2 players.
                    stats.combat.losses.carriers += playerCarriers.filter(c => !c.ships).length;
                    stats.combat.losses.specialists += playerCarriers.filter(c => !c.ships && c.specialistId).length;
                });
            }
        }

        // Add combat result stats to attacker achievements.
        for (let attackerUser of attackerUsers) {
            let attacker = attackers.find(u => u.userId && u.userId.toString() === attackerUser._id.toString())!;

            if (attacker && !attacker.defeated) {
                const playerCarriers = attackerCarriers.filter(c => c.ownedByPlayerId!.toString() === attacker._id.toString());

                this.statisticsService.modifyStats(game._id, attacker._id, (stats) => {
                    stats.combat.kills.ships += combatResult.lost.defender;
                    stats.combat.kills.carriers += defenderCarriersDestroyed;
                    stats.combat.kills.specialists += defenderSpecialistsDestroyed;

                    stats.combat.losses.ships += combatResult.lost.attacker; // TODO: This will not be correct in combat where its more than 2 players.
                    stats.combat.losses.carriers += playerCarriers.filter(c => !c.ships).length;
                    stats.combat.losses.specialists += playerCarriers.filter(c => !c.ships && c.specialistId).length;
                });
            }
        } */
    }
}