import {Carrier} from "./types/Carrier";
import {Game} from "./types/Game";
import {Player} from "./types/Player";
import {Star, StarCaptureResult} from "./types/Star";
import {User} from "./types/User";
import {CombatResult, CombatService, GameTypeService} from '@solaris/common'

import EventEmitter from "events";
import {DBObjectId} from "./types/DBObjectId";
import StarCaptureService from "./starCapture";

export const CombatServiceEvents = {
    onPlayerCombatStar: 'onPlayerCombatStar',
    onPlayerCombatCarrier: 'onPlayerCombatCarrier'
}

export default class CombatProcessingService extends EventEmitter {
    combatService: CombatService<DBObjectId>;
    gameTypeService: GameTypeService;
    starCaptureService: StarCaptureService;

    constructor(
        combatService: CombatService<DBObjectId>,
        gameTypeService: GameTypeService,
        starCaptureService: StarCaptureService,
    ) {
        super();

        this.gameTypeService = gameTypeService;
        this.combatService = combatService;
        this.starCaptureService = starCaptureService;
    }

    async performCombat(game: Game, gameUsers: User[], defender: Player, star: Star | null, carriers: Carrier[]) {
        let combatResult: CombatResult<DBObjectId>;
        if (star) {
            combatResult = this.combatService.computeStar(game, star, carriers);
        } else {
            combatResult = this.combatService.computeCarrier(game, carriers);
        }

        // Distribute damage evenly across all objects that are involved in combat.
        this._distributeDamage(game, combatResult);

        if (!this.gameTypeService.isTutorialGame(game)) {
            this._updatePlayersCombatAchievements(game, gameUsers, combatResult);
        }

        // Remove any carriers from the game that have been destroyed.
        const destroyedCarriers = game.galaxy.carriers.filter(c => !c.ships);

        for (let carrier of destroyedCarriers) {
            game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(carrier), 1);
        }

        let captureResult: StarCaptureResult | null = null;

        if (star) {
            captureResult = this._starDefeatedCheck(game, star, combatResult);
        }

        this._deductReputation(game, combatResult);

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

    _deductReputation(game: Game, combatResult: CombatResult<DBObjectId>) {

    }

    _starDefeatedCheck(game: Game, star: Star, combatResult: CombatResult<DBObjectId>) {
        let starDefenderDefeated = star && !Math.floor(star.shipsActual!) && !defenderCarriers.length;
        let hasAttackersRemaining = attackerCarriers.reduce((sum, c) => sum + c.ships!, 0) > 0;
        let hasCapturedStar = starDefenderDefeated && hasAttackersRemaining;

        if (hasCapturedStar) {
            return this.starCaptureService.captureStar(game, star, owner, defenders, defenderUsers, attackers, attackerUsers, attackerCarriers);
        }

        return null;
    }

    _distributeDamage(game: Game, result: CombatResult<DBObjectId>) {
        while (shipsToKill) {
            let objectsToDeduct = damageObjects
                .filter(c =>
                    c.ships > 0 &&
                    // Is the star
                    // OR allow destroying carriers
                    // OR if NOT destroying carriers then carriers that have more than 1 ship.
                    (c.shipsActual != null || destroyCarriers || c.ships > 1)
                )
                .sort((a, b) => {
                    // Sort by specialist (kill objects without specialists first)
                    if (a.specialistId == null && b.specialistId != null) {
                        return -1;
                    } else if (a.specialistId != null && b.specialistId == null) {
                        return 1;
                    }

                    // Sort by ships descending (kill objects with the most ships first)
                    if (a.ships > b.ships) return -1;
                    if (a.ships < b.ships) return 1;

                    return 0; // Both are the same.
                });

            if (!objectsToDeduct.length) {
                return shipsToKill;
            }

            // Try to distribute damage evenly across all objects, minimum of 1.
            let shipsPerObject = Math.max(1, Math.floor(shipsToKill / objectsToDeduct.length));

            for (let obj of objectsToDeduct) {
                let isCarrier = obj.shipsActual == null;
                let combatObject: CombatCarrier | CombatStar = (combatResult.carriers.find(c => c._id.toString() === obj._id.toString()) || combatResult.star)!;

                // Calculate how many ships to kill, capped to however many ships the object has.
                let killed: number;

                // If we are not destroying carriers then we need to keep
                // at least 1 ship on the carrier, otherwise just kill them all.
                if (!destroyCarriers && isCarrier) {
                    killed = Math.min(obj.ships - 1, shipsPerObject);
                } else {
                    killed = Math.min(obj.ships, shipsPerObject);
                }

                killed = Math.max(0, killed); // Just in case.

                combatObject.after = (combatObject.after as number) - killed;
                combatObject.lost = (combatObject.lost as number) + killed;
                shipsToKill -= killed;

                // Apply damage to the carrier or star.
                if (isCarrier) {
                    obj.ships -= killed;
                } else {
                    obj.shipsActual -= killed;
                    obj.ships = Math.floor(obj.shipsActual);
                }

                // If there's no more ships to kill then break out early
                // so we don't deduct too many ships from the objects.
                if (!shipsToKill) {
                    break;
                }
            }
        }

        return shipsToKill;
    }

    _updatePlayersCombatAchievements(game: Game, gameUsers: User[], combatResult: CombatResult<DBObjectId>) {
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
        }
    }
}