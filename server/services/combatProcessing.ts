import {Game} from "./types/Game";
import {Player} from "./types/Player";
import {User} from "./types/User";
import {
    Carrier, DetailedCombatResult,
    CombatService,
    GameTypeService,
    notUndefined,
    Star,
    StarCaptureResult,
    CombatResult, CombatResultGroup, DetailedCombatResultCarrier, CombatResultCarrier, DetailedCombatResultGroup,
    CombatResultStar, Specialist,
} from '@solaris/common'
import EventEmitter from "events";
import {DBObjectId} from "./types/DBObjectId";
import StarCaptureService from "./starCapture";
import ReputationService from "./reputation";
import PlayerService from "./player";
import StatisticsService from "./statistics";
import SpecialistService from "./specialist";

export const CombatServiceEvents = {
    onPlayerCombatStar: 'onPlayerCombatStar',
    onPlayerCombatCarrier: 'onPlayerCombatCarrier',
}

export default class CombatProcessingService extends EventEmitter {
    combatService: CombatService<DBObjectId>;
    gameTypeService: GameTypeService;
    starCaptureService: StarCaptureService;
    reputationService: ReputationService;
    playerService: PlayerService;
    statisticsService: StatisticsService;
    specialistService: SpecialistService;

    constructor(
        combatService: CombatService<DBObjectId>,
        gameTypeService: GameTypeService,
        starCaptureService: StarCaptureService,
        reputationService: ReputationService,
        playerService: PlayerService,
        statisticsService: StatisticsService,
        specialistService: SpecialistService,
    ) {
        super();

        this.gameTypeService = gameTypeService;
        this.combatService = combatService;
        this.starCaptureService = starCaptureService;
        this.reputationService = reputationService;
        this.playerService = playerService;
        this.statisticsService = statisticsService;
        this.specialistService = specialistService;
    }

    _distributeDamage(combatResult: DetailedCombatResult<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>) {
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

    _couldHideShips(star: Star<DBObjectId> | undefined, specialist: Specialist | null) {
        const isNebula = Boolean(star?.isNebula);

        const hideShips = Boolean(specialist?.modifiers?.special?.hideShips);

        return isNebula || hideShips;
    }

    _lowerResultCarriers(group: DetailedCombatResultGroup<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>, c: DetailedCombatResultCarrier<DBObjectId, Carrier<DBObjectId>>): CombatResultCarrier<DBObjectId> {
        const hasScrambler = this._couldHideShips(group.star?.star, this.specialistService.getByIdCarrier(c.carrier.specialistId));

        return {
            carrierId: c.carrier._id,
            specialistId: c.carrier.specialistId,
            carrierName: c.carrier.name,
            ownedByPlayerId: c.carrier.ownedByPlayerId!,
            shipsAfter: c.shipsAfter,
            shipsLost: c.shipsLost,
            shipsBefore: c.shipsBefore,
            hasScrambler,
        };
    }

    _lowerResultStar(group: DetailedCombatResultGroup<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>, captureResult: StarCaptureResult<DBObjectId> | null): CombatResultStar<DBObjectId> | undefined {
        if (!group.star) {
            return undefined;
        }

        const hasScrambler = this._couldHideShips(group.star?.star, this.specialistService.getByIdCarrier(group.star.star.specialistId));

        return {
            starId: group.star.star._id,
            specialistId: group.star.star.specialistId,
            starName: group.star.star.name,
            ownedByPlayerId: group.star.star.ownedByPlayerId!,
            shipsBefore: group.star.shipsBefore,
            shipsAfter: group.star.shipsAfter,
            shipsLost: group.star.shipsLost,
            hasScrambler,
            captureResult,
        }
    }

    lowerResult(result: DetailedCombatResult<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>, captureResult: StarCaptureResult<DBObjectId> | null): CombatResult<DBObjectId> {
        const groups: CombatResultGroup<DBObjectId>[] = result.groups.map((g) => {
            return {
                playerIds: g.players.map(p => p._id),
                carriers: g.carriers.map(c => this._lowerResultCarriers(g, c)),
                star: this._lowerResultStar(g, captureResult),
                attackAgainst: g.attackAgainst,
                shipsBefore: g.shipsBefore,
                shipsAfter: g.shipsAfter,
                shipsLost: g.shipsLost,
            };
        });

        return {
            groups,
        };
    }

    async performCombat(game: Game, gameUsers: User[], star: Star<DBObjectId> | null, carriers: Carrier<DBObjectId>[]): Promise<DetailedCombatResult<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>> {
        let combatResult: DetailedCombatResult<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>;

        if (star) {
            combatResult = this.combatService.computeStar(game, star, carriers);
        } else {
            combatResult = this.combatService.computeCarrier(game, carriers);
        }

        // Distribute damage evenly across all objects that are involved in combat.
        this._distributeDamage(combatResult);

        if (!this.gameTypeService.isTutorialGame(game)) {
            await this._updatePlayersCombatAchievements(game, gameUsers, combatResult);
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

        const eventResult = this.lowerResult(combatResult, captureResult);

        // Log the combat event
        if (star) {
            this.emit(CombatServiceEvents.onPlayerCombatStar, {
                gameId: game._id,
                gameTick: game.state.tick,
                combatResult: eventResult,
            });
        } else {
            this.emit(CombatServiceEvents.onPlayerCombatCarrier, {
                gameId: game._id,
                gameTick: game.state.tick,
                combatResult: eventResult,
            });
        }

        return combatResult;
    }

    async _deductReputation(game: Game, combatResult: DetailedCombatResult<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>) {
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

    _starDefeatedCheck(game: Game, star: Star<DBObjectId>, combatResult: DetailedCombatResult<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>, gameUsers: User[]) {
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

    async _updatePlayersCombatAchievements(game: Game, gameUsers: User[], combatResult: DetailedCombatResult<DBObjectId, Player, Star<DBObjectId>, Carrier<DBObjectId>>) {
        for (let group of combatResult.groups) {
            for (let player of group.players) {
                const user = this._findUser(gameUsers, player);

                if (!user) {
                    continue;
                }

                const pc = group.players.length;

                await this.statisticsService.modifyStats(game._id, player._id, (stats) => {
                    stats.combat.kills.ships += Math.floor(group.shipsKilled / pc);
                    stats.combat.kills.carriers += Math.floor(group.carriersKilled / pc);
                    stats.combat.kills.specialists += Math.floor(group.specialistsKilled / pc);

                    stats.combat.losses.ships += Math.floor(group.shipsLost / pc);
                    stats.combat.losses.carriers += Math.floor(group.carriersLost / pc);
                    stats.combat.losses.specialists += Math.floor(group.specialistsLost / pc);
                });
            }
        }
    }
}