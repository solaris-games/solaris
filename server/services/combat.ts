import {Carrier} from "./types/Carrier";
import {
    Attacker,
    CombatCarrier,
    CombatPart,
    CombatResult,
    CombatResultShips,
    CombatStar,
    Defender
} from "./types/Combat";
import {Game} from "./types/Game";
import {Player} from "./types/Player";
import {Star, StarCaptureResult} from "./types/Star";
import {User} from "./types/User";
import DiplomacyService from "./diplomacy";
import {GameTypeService, TechnologyService} from 'solaris-common'
import PlayerService from "./player";
import ReputationService from "./reputation";
import SpecialistService from "./specialist";
import StarService from "./star";
import StarCaptureService from "./starCapture";
import StatisticsService from "./statistics";

import EventEmitter from "events";

export const CombatServiceEvents = {
    onPlayerCombatStar: 'onPlayerCombatStar',
    onPlayerCombatCarrier: 'onPlayerCombatCarrier'
}

export default class CombatService extends EventEmitter {
    technologyService: TechnologyService;
    specialistService: SpecialistService;
    playerService: PlayerService;
    starService: StarService;
    reputationService: ReputationService;
    diplomacyService: DiplomacyService;
    gameTypeService: GameTypeService;
    starCaptureService: StarCaptureService;
    statisticsService: StatisticsService;
    
    constructor(
        technologyService: TechnologyService,
        specialistService: SpecialistService,
        playerService: PlayerService,
        starService: StarService,
        reputationService: ReputationService,
        diplomacyService: DiplomacyService,
        gameTypeService: GameTypeService,
        starCaptureService: StarCaptureService,
        statisticsService: StatisticsService,
    ) {
        super();

        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.playerService = playerService;
        this.starService = starService;
        this.reputationService = reputationService;
        this.diplomacyService = diplomacyService;
        this.gameTypeService = gameTypeService;
        this.starCaptureService = starCaptureService;
        this.statisticsService = statisticsService;
    }

    calculate(defender: Defender, attacker: Attacker, isTurnBased: boolean = true, calculateNeeded: boolean = false): CombatResultShips {
        let defenderShipsRemaining = defender.ships;
        let attackerShipsRemaining = attacker.ships;

        let defendPowerBase = defender.weaponsLevel;
        let attackPowerBase = attacker.weaponsLevel;
        let defendPower = defender.weaponsLevel;
        let attackPower = attacker.weaponsLevel;

        // If in non-turn based mode the attacker/defender cannot survive a single blow
        // then they should outright be destroyed without delivering a blow to the opposition.
        // Note: This addresses an exploit where players can send out 1 ship carriers to chip away 
        // at incoming carriers.
        if (!isTurnBased) {
            if (defender.ships <= attacker.weaponsLevel) {
                defendPower = 1;
            }
            
            if (attacker.ships <= defender.weaponsLevel) {
                attackPower = 1;
            }
        }

        const defenderAdditionalTurns = isTurnBased ? 1 : 0;

        const defenderTurns = Math.ceil(attacker.ships / defendPower);
        const attackerTurns = Math.ceil(defender.ships / attackPower);

        let needed: CombatPart | null = null;

        if (defenderTurns <= attackerTurns)  {
            attackerShipsRemaining = 0;
            defenderShipsRemaining = defender.ships - (defenderTurns - defenderAdditionalTurns) * attackPower;

            if (calculateNeeded) {
                needed = {
                    defender: 0,
                    attacker: attackerTurns * defendPower + 1
                };
            }
        } else {
            defenderShipsRemaining = 0;
            attackerShipsRemaining = attacker.ships - attackerTurns * defendPower;

            if (calculateNeeded) {
                needed = {
                    attacker: 0,
                    defender: (defenderTurns - defenderAdditionalTurns) * attackPower + defenderAdditionalTurns
                };
            }
        }

        attackerShipsRemaining = Math.max(0, attackerShipsRemaining);
        defenderShipsRemaining = Math.max(0, defenderShipsRemaining);
        
        let result: CombatResultShips = {
            weapons: {
                defender: defendPower,
                defenderBase: defendPowerBase,
                attacker: attackPower,
                attackerBase: attackPowerBase
            },
            before: {
                defender: defender.ships,
                attacker: attacker.ships
            },
            after: {
                defender: defenderShipsRemaining,
                attacker: attackerShipsRemaining
            },
            lost: {
                defender: defender.ships - defenderShipsRemaining,
                attacker: attacker.ships - attackerShipsRemaining
            }
        };

        if (calculateNeeded) {
            result.needed = needed;
        }

        return result;
    }

    calculateStar(game: Game, star: Star, defenders: Player[], attackers: Player[], defenderCarriers: Carrier[], attackerCarriers: Carrier[], calculateNeeded: boolean = false) {
        const combatWeapons = this._calculateEffectiveWeaponsLevels(game, star, defenders, attackers, defenderCarriers, attackerCarriers);

        return this.calculate({
            weaponsLevel: combatWeapons.defenderWeaponsTechLevel,
            ships: combatWeapons.totalDefenders
        }, {
            weaponsLevel: combatWeapons.attackerWeaponsTechLevel,
            ships: combatWeapons.totalAttackers
        }, true, calculateNeeded);
    }

    calculateCarrier(game: Game, defenders: Player[], attackers: Player[], defenderCarriers: Carrier[], attackerCarriers: Carrier[]) {
        const combatWeapons = this._calculateEffectiveWeaponsLevels(game, null, defenders, attackers, defenderCarriers, attackerCarriers);

        return this.calculate({
            weaponsLevel: combatWeapons.defenderWeaponsTechLevel,
            ships: combatWeapons.totalDefenders
        }, {
            weaponsLevel: combatWeapons.attackerWeaponsTechLevel,
            ships: combatWeapons.totalAttackers
        }, false);
    }

    _calculateEffectiveWeaponsLevels(game: Game, star: Star | null, defenders: Player[], attackers: Player[], defenderCarriers: Carrier[], attackerCarriers: Carrier[]) {
        const isCarrierToStarCombat = star != null;

        // Calculate the total number of defending ships
        let totalDefenders = defenderCarriers.reduce((sum, c) => sum + c.ships!, 0);

        if (isCarrierToStarCombat) {
            totalDefenders += Math.floor(star!.shipsActual!);
        }
        
        // Calculate the total number of attacking ships
        const totalAttackers = attackerCarriers.reduce((sum, c) => sum + c.ships!, 0);

        // Calculate the defender weapons tech level based on any specialists present at stars or carriers.
        let defenderWeaponsTechLevel: number;

        if (isCarrierToStarCombat) {
            defenderWeaponsTechLevel = this.technologyService.getStarEffectiveWeaponsLevel(game, defenders, star!, defenderCarriers).total;
        } else {
            defenderWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, defenders, defenderCarriers, isCarrierToStarCombat, false, 'anyCarrier').total;
        }

        const attackerMalusStrategy = isCarrierToStarCombat ? game.settings.specialGalaxy.combatResolutionMalusStrategy : 'anyCarrier';
        // Calculate the weapons tech level for the attacker
        let attackerWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, attackers, attackerCarriers, isCarrierToStarCombat, true, attackerMalusStrategy).total;

        // Check for deductions to weapons to either side
        const defenderWeaponsDeduction = this.technologyService.getCarriersWeaponsDebuff(attackerCarriers);
        const attackerWeaponsDeduction = this.technologyService.getCarriersWeaponsDebuff(defenderCarriers);

        // Ensure that both sides fight with AT LEAST level 1 weapons
        defenderWeaponsTechLevel = Math.max(defenderWeaponsTechLevel - defenderWeaponsDeduction, 1);
        attackerWeaponsTechLevel = Math.max(attackerWeaponsTechLevel - attackerWeaponsDeduction, 1);

        // Check to see if weapons tech should be swapped (joker specialist)
        const defenderSwapWeapons = this._shouldSwapWeaponsTech(defenderCarriers);
        const attackerSwapWeapons = this._shouldSwapWeaponsTech(attackerCarriers);

        const shouldSwapWeaponsTech = (isCarrierToStarCombat && attackerSwapWeapons && !defenderSwapWeapons) ||   // Attacker controls controls the weapon swap in c2s combat unless both have jokers
                                    (!isCarrierToStarCombat && attackerSwapWeapons !== defenderSwapWeapons);    // In c2c combat, swap weapons unless both have jokers

        if (shouldSwapWeaponsTech) {
            let oldDefenderWeaponsTechLevel = defenderWeaponsTechLevel;
            defenderWeaponsTechLevel = attackerWeaponsTechLevel;
            attackerWeaponsTechLevel = oldDefenderWeaponsTechLevel;
        }

        return {
            totalDefenders,
            totalAttackers,
            defenderWeaponsTechLevel,
            attackerWeaponsTechLevel
        };
    }

    async performCombat(game: Game, gameUsers: User[], defender: Player, star: Star | null, carriers: Carrier[]) {
        const isFormalAlliancesEnabled = this.diplomacyService.isFormalAlliancesEnabled(game);

        // NOTE: If star is null then the combat mode is carrier-to-carrier.

        // Allies of the defender will be on the defending side.
        let defenderAllies: Player[] = [];

        if (isFormalAlliancesEnabled) {
            defenderAllies = this.diplomacyService.getAlliesOfPlayer(game, defender);
        }

        // Get all defender carriers ordered by most carriers present descending.
        // Carriers who have the most ships will be target first in combat.
        let defenderCarriers = carriers
            .filter(c => 
                c.ships! > 0
                && !c.isGift
                && (c.ownedByPlayerId!.toString() === defender._id.toString()) || defenderAllies.find(a => a._id.toString() === c.ownedByPlayerId!.toString())  // Either owned by the defender or owned by an ally
            )
            .sort((a, b) => b.ships! - a.ships!);

        // If in carrier-to-carrier combat, verify that there are carriers that can fight.
        if (!star && !defenderCarriers.length) {
            return;
        }

        // Get all attacker carriers.
        let attackerCarriers = carriers
            .filter(c => 
                c.ships! > 0 
                && !c.isGift 
                && c.ownedByPlayerId!.toString() !== defender._id.toString()    // Not owned by the player and
                && !defenderAllies.find(a => a._id.toString() === c.ownedByPlayerId!.toString())   // Not owned by an ally
            )
            .sort((a, b) => b.ships! - a.ships!);

        // Double check that the attacking carriers can fight.
        if (!attackerCarriers.length) {
            return;
        }

        // Get the players for the defender and all attackers.
        let defenderPlayerIds = defenderCarriers.map(c => c.ownedByPlayerId!.toString());
        defenderPlayerIds.push(defender._id.toString());
        defenderPlayerIds = [...new Set(defenderPlayerIds)];

        let attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId!.toString()))];

        let defenders: Player[] = defenderPlayerIds.map(playerId => this.playerService.getById(game, playerId as any)!);
        let attackers: Player[] = attackerPlayerIds.map(playerId => this.playerService.getById(game, playerId as any)!);

        let defenderUsers: User[] = [];
        let attackerUsers: User[] = [];
        
        for (let defender of defenders) {
            let user = gameUsers.find(u => defender.userId && u._id.toString() === defender.userId.toString());
            
            if (user) {
                defenderUsers.push(user);
            }
        }
        
        for (let attacker of attackers) {
            let user = gameUsers.find(u => attacker.userId && u._id.toString() === attacker.userId.toString());
            
            if (user) {
                attackerUsers.push(user);
            }
        }

        // Perform combat at the star.
        let combatResultShips: CombatResultShips;
        
        if (star) {
            combatResultShips = this.calculateStar(game, star, defenders, attackers, defenderCarriers, attackerCarriers);
        } else {
            combatResultShips = this.calculateCarrier(game, defenders, attackers, defenderCarriers, attackerCarriers);
        }

        let combatResult: CombatResult = {
            ...combatResultShips,
            star: null,
            carriers: []
        };

        // Add all of the carriers to the combat result with a snapshot of
        // how many ships they had before combat occurs.
        // We will update this as we go along with combat.
        combatResult.carriers = carriers.map(c => {
            let specialist = this.specialistService.getByIdCarrierTrim(c.specialistId);
            let scrambled = (star && star.isNebula && defenderPlayerIds.includes(c.ownedByPlayerId!.toString())) || this.specialistService.getCarrierHideShips(c); 

            return {
                _id: c._id,
                name: c.name,
                ownedByPlayerId: c.ownedByPlayerId!,
                specialist,
                before: c.ships!,
                lost: 0,
                after: c.ships!,
                scrambled
            };
        });

        if (star) {
            let specialist = this.specialistService.getByIdStarTrim(star.specialistId);
            let scrambled = star.isNebula || this.specialistService.getStarHideShips(star);

            // Do the same with the star.
            combatResult.star = {
                _id: star._id,
                ownedByPlayerId: star.ownedByPlayerId,
                specialist,
                before: Math.floor(star.shipsActual!),
                lost: 0,
                after: Math.floor(star.shipsActual!),
                scrambled
            };
        }

        let defenderObjects: (Star | Carrier)[] = [...defenderCarriers];

        if (star) {
            defenderObjects.push(star);
        }

        // Distribute damage evenly across all objects that are involved in combat.
        this._distributeDamage(combatResult, attackerCarriers, combatResult.lost.attacker, true);
        this._distributeDamage(combatResult, defenderObjects, combatResult.lost.defender, true);

        if (!this.gameTypeService.isTutorialGame(game)) {
            this._updatePlayersCombatAchievements(game, combatResult, defenders, defenderUsers, defenderCarriers, attackers, attackerUsers, attackerCarriers);
        }

        // Remove any carriers from the game that have been destroyed.
        let destroyedCarriers = game.galaxy.carriers.filter(c => !c.ships);

        for (let carrier of destroyedCarriers) {
            game.galaxy.carriers.splice(game.galaxy.carriers.indexOf(carrier), 1);

            if (attackerCarriers.indexOf(carrier) > -1) {
                attackerCarriers.splice(attackerCarriers.indexOf(carrier), 1);
            }

            if (defenderCarriers.indexOf(carrier) > -1) {
                defenderCarriers.splice(defenderCarriers.indexOf(carrier), 1);
            }
        }

        // If the defender has been eliminated at the star then the attacker who travelled the shortest distance in the last tick
        // captures the star. Repeat star combat until there is only one player remaining.
        let captureResult: StarCaptureResult | null = null;

        if (star) {
            captureResult = this._starDefeatedCheck(game, star, defender, defenders, defenderUsers, defenderCarriers, attackers, attackerUsers, attackerCarriers);
        }

        // Deduct reputation for all attackers that the defender is fighting and vice versa.
        for (let defenderPlayer of defenders) {
            for (let attackerPlayer of attackers) {
                await this.reputationService.decreaseReputation(game, attackerPlayer, defenderPlayer, false);
                await this.reputationService.decreaseReputation(game, defenderPlayer, attackerPlayer, false);
            }
        }

        // Log the combat event
        if (star) {
            this.emit(CombatServiceEvents.onPlayerCombatStar, {
                gameId: game._id,
                gameTick: game.state.tick,
                owner: defender,
                defenders,
                attackers,
                star,
                combatResult,
                captureResult
            });
        } else {
            this.emit(CombatServiceEvents.onPlayerCombatCarrier, {
                gameId: game._id,
                gameTick: game.state.tick,
                defenders,
                attackers,
                combatResult
            });
        }

        // If there are still attackers remaining, recurse.
        attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId!.toString()))];

        if (attackerPlayerIds.length > 1) {
            // Get the next player to act as the defender.
            if (star) {
                defender = this.playerService.getById(game, star.ownedByPlayerId!)!;
            } else {
                defender = this.playerService.getById(game, attackerPlayerIds[0] as any)!;
            }

            await this.performCombat(game, gameUsers, defender, star, attackerCarriers);
        }

        return combatResultShips;
    }

    _starDefeatedCheck(game: Game, star: Star, owner: Player, defenders: Player[], defenderUsers: User[], defenderCarriers: Carrier[], attackers: Player[], attackerUsers: User[], attackerCarriers: Carrier[]) {
        let starDefenderDefeated = star && !Math.floor(star.shipsActual!) && !defenderCarriers.length;
        let hasAttackersRemaining = attackerCarriers.reduce((sum, c) => sum + c.ships!, 0) > 0;
        let hasCapturedStar = starDefenderDefeated && hasAttackersRemaining;

        if (hasCapturedStar) {
            return this.starCaptureService.captureStar(game, star, owner, defenders, defenderUsers, attackers, attackerUsers, attackerCarriers);
        }

        return null;
    }

    _distributeDamage(combatResult: CombatResult, damageObjects, shipsToKill: number, destroyCarriers: boolean = true) {
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

    _updatePlayersCombatAchievements(game: Game, combatResult: CombatResult, defenders: Player[], defenderUsers: User[], defenderCarriers: Carrier[], attackers: Player[], attackerUsers: User[], attackerCarriers: Carrier[]) {
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

    _shouldSwapWeaponsTech(carriers: Carrier[]) {
        return carriers
            .filter(c => c.specialistId)
            .find(c => this.specialistService.getByIdCarrier(c.specialistId)?.modifiers.special?.combatSwapWeaponsTechnology) != null;
    }

    sanitiseCombatResult(combatResult: CombatResult, player: Player) {
        let result: CombatResult = Object.assign({}, combatResult);

        if (result.star) {
            result.star = this.tryMaskObjectShips(combatResult.star, player) as CombatStar;
        }

        result.carriers = combatResult.carriers.map(c => this.tryMaskObjectShips(c, player)) as CombatCarrier[];

        return result;
    }

    tryMaskObjectShips(carrierOrStar: CombatStar | CombatCarrier | null, player: Player) {
        if (!carrierOrStar) {
            return carrierOrStar;
        }

        // If the player doesn't own the object and the object is a scrambler then we need
        // to mask the before and lost amounts.
        if (carrierOrStar.scrambled && carrierOrStar.ownedByPlayerId && player._id.toString() !== carrierOrStar.ownedByPlayerId.toString()) {
            let clone: CombatStar | CombatCarrier = Object.assign({}, carrierOrStar);

            clone.before = '???';
            clone.lost = '???';

            // If the object lost ships and is now dead, then we need to mask the after value too.
            // Note: Stars can have a 0 ship garrison and be a scrambler so we want to ensure that the 0 ships is still scrambled.
            // cast is safe here because it can't be a string at this stage
            if (carrierOrStar.before === 0 || (carrierOrStar.after as number) > 0) {
                clone.after = '???';
            }

            return clone;
        }

        return carrierOrStar;
    }

}
