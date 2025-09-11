import { Carrier } from "./types/Carrier";
import { Game } from "./types/Game";
import { Player, PlayerTechnologyLevels, ResearchTypeNotRandom } from "./types/Player";
import { Star } from "./types/Star";
import SpecialistService from "./specialist";
import GameTypeService from "./gameType";
import {maxBy} from "./utils";
import {CombatResolutionMalusStrategy} from "@solaris-common";

const DEFAULT_TECHNOLOGIES: ResearchTypeNotRandom[] = [
    'terraforming',
    'experimentation',
    'banking',
    'weapons',
    'manufacturing',
    'specialists',
    'scanning',
    'hyperspace'
];

export default class TechnologyService {
    specialistService: SpecialistService;
    gameTypeService: GameTypeService;

    constructor(
        specialistService: SpecialistService,
        gameTypeService: GameTypeService
    ) {
        this.specialistService = specialistService;
        this.gameTypeService = gameTypeService;
    }

    getResearchableTechnologies(game: Game) {
        let techs: ResearchTypeNotRandom[] = Object.keys(game.settings.technology.researchCosts).filter(k => {
            return k.match(/^[^_\$]/) != null;
        }) as ResearchTypeNotRandom[];

        return techs.filter(t => this.isTechnologyResearchable(game, t));
    }

    // Enabled means: will this technology be in effect? It can be enabled, but not researchable (thereby fixed).
    isTechnologyEnabled(game: Game, techKey: ResearchTypeNotRandom) {
        return game.settings.technology.startingTechnologyLevel[techKey] > 0;
    }

    isTechnologyResearchable(game: Game, technologyKey: ResearchTypeNotRandom) {
      return this.isTechnologyEnabled(game, technologyKey) && game.settings.technology.researchCosts[technologyKey] !== 'none'
    }

    getDefaultTechnology(game: Game): ResearchTypeNotRandom {
        const researchableTechnologies = this.getResearchableTechnologies(game);

        return DEFAULT_TECHNOLOGIES.find(t => researchableTechnologies.includes(t)) || 'weapons';
    }

    _applyTechModifiers(techs: PlayerTechnologyLevels, modifiers, sanitize: boolean = true) { // TODO: types
        techs.scanning += modifiers.scanning || 0;
        techs.hyperspace += modifiers.hyperspace || 0;
        techs.terraforming += modifiers.terraforming || 0;
        techs.experimentation += modifiers.experimentation || 0;
        techs.weapons += modifiers.weapons || 0;
        techs.banking += modifiers.banking || 0;
        techs.manufacturing += modifiers.manufacturing || 0;
        techs.specialists += modifiers.specialists || 0;
        
        if (sanitize) {
            techs.scanning = Math.max(1, techs.scanning);
            techs.hyperspace = Math.max(1, techs.hyperspace);
            techs.terraforming = Math.max(1, techs.terraforming);
            techs.experimentation = Math.max(1, techs.experimentation);
            techs.weapons = Math.max(1, techs.weapons);
            techs.banking = Math.max(1, techs.banking);
            techs.manufacturing = Math.max(1, techs.manufacturing);
            techs.specialists = Math.max(1, techs.specialists);
        }

        return techs;
    }

    getPlayerEffectiveTechnologyLevels(game: Game, player: Player | null, sanitize: boolean = true): PlayerTechnologyLevels {
        // TODO: This is a plaster over a bug where in the gameGalaxy service
        // it sets research to null if its in extra dark galaxy but somehow
        // this function is still being called by getStats. Needs investigating...
        // TODO: The player in question had 0 stars and 1 carrier, with this
        // fix the extra dark galaxy loads but there's 1 star that doesn't have a name
        // that gets returned in the response.
        // TODO: It probably has something to do with scanning range, maybe it
        // isn't checking if players have 0 stars? In which case they have no scanning range
        // and therefore nobody is within scanning range.
    
        if (!player || !player.research) {
            return {
                scanning: 1,
                hyperspace: 1,
                terraforming: 1,
                experimentation: 1,
                weapons: 1,
                banking: 1,
                manufacturing: 1,
                specialists: 1
            };
        }

        let techs = {
            scanning: player.research.scanning.level,
            hyperspace: player.research.hyperspace.level,
            terraforming: player.research.terraforming.level,
            experimentation: player.research.experimentation.level,
            weapons: player.research.weapons.level,
            banking: player.research.banking.level,
            manufacturing: player.research.manufacturing.level,
            specialists: player.research.specialists.level
        };

        return techs;
    }

    getStarEffectiveTechnologyLevels(game: Game, star: Star, sanitize: boolean = true): PlayerTechnologyLevels {
        let player = star.ownedByPlayerId ? game.galaxy.players.find(x => x._id.toString() === star.ownedByPlayerId!.toString()) || null : null;
        let techs = this.getPlayerEffectiveTechnologyLevels(game, player, false);

        if (star.specialistId) {
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            if (specialist && specialist.modifiers.local != null) {
                this._applyTechModifiers(techs, specialist.modifiers.local, sanitize);
            }
        }

        if (star.isBlackHole) {
            techs.scanning += 3;
        }

        return techs;
    }

    getCarrierEffectiveTechnologyLevels(game: Game, carrier: Carrier, sanitize: boolean = true) {
        let player = game.galaxy.players.find(x => x._id.toString() === carrier.ownedByPlayerId!.toString()) || null;
        let techs = this.getPlayerEffectiveTechnologyLevels(game, player, false);

        // Apply any specialist tech modifiers.
        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist && specialist.modifiers.local != null) {
                this._applyTechModifiers(techs, specialist.modifiers.local, sanitize);
            }
        }

        return techs;
    }

    getStarWeaponsBuff(star: Star) {
        if (star.specialistId) {
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            if (specialist && specialist.modifiers.local != null) {
                return specialist.modifiers.local.weapons || 0;
            }
        }

        return 0;
    }

    getCarrierWeaponsBuff(carrier: Carrier, isCarrierToStarCombat: boolean, isAttacker: boolean, allyCount: number, strategy: CombatResolutionMalusStrategy, isLargestCarrier: boolean) {
        const buffs: number[] = [];

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (!specialist) {
                return 0;
            }
            
            if (specialist.modifiers.local) {
                if (isCarrierToStarCombat && specialist.modifiers.local.carrierToStarCombat) {
                    if (isAttacker && specialist.modifiers.local.carrierToStarCombat.attacker?.weapons) {
                        buffs.push(specialist.modifiers.local.carrierToStarCombat.attacker.weapons);
                    }

                    if (!isAttacker && specialist.modifiers.local.carrierToStarCombat.defender?.weapons) {
                        buffs.push(specialist.modifiers.local.carrierToStarCombat.defender.weapons);
                    }

                    if (isAttacker && specialist.modifiers.local.carrierToStarCombat.attacker?.perAlly) {
                        const adjustedAllyCount = Math.min(allyCount, specialist.modifiers.local.carrierToStarCombat.attacker.perAlly.maxAllies);
                        buffs.push(specialist.modifiers.local.carrierToStarCombat.attacker.perAlly.weapons * adjustedAllyCount);
                    }
                }

                if (!isCarrierToStarCombat && specialist.modifiers.local.carrierToCarrierCombat?.weapons) {
                    buffs.push(specialist.modifiers.local.carrierToCarrierCombat.weapons);
                }
                
                if (specialist.modifiers.local.weapons) {
                    const isDebuff = specialist.modifiers.local.weapons < 0;
                    const isMalusCarrier = (strategy === 'anyCarrier') || (strategy === 'largestCarrier' && isLargestCarrier);

                    if (!isDebuff || isMalusCarrier) {
                        buffs.push(specialist.modifiers.local.weapons);
                    }
                }
            }
        }

        if (!buffs.length) {
            return 0;
        }

        return buffs.sort((a, b) => b - a)[0];
    }

    getCarriersWeaponsDebuff(carriersToCheck: Carrier[]) {
        let deduction = 0;
        
        if (!carriersToCheck.length) {
            return 0;
        }
        
        // If any of the carriers have a specialist which deducts enemy weapons
        // then find the one that has the highest deduction.
        deduction = carriersToCheck
            .filter(c => c.specialistId != null)
            .map(c => {
                let specialist = this.specialistService.getByIdCarrier(c.specialistId!);

                if (specialist && specialist.modifiers.special && specialist.modifiers.special.deductEnemyWeapons) {
                    return specialist.modifiers.special.deductEnemyWeapons;
                }

                return 0;
            })
            .sort((a, b) => b - a)[0];

        return deduction || 0;
    }

    getStarEffectiveWeaponsLevel(game: Game, defenders: Player[], star: Star, carriersInOrbit: Carrier[]) {
        let weapons = defenders.sort((a, b) => b.research.weapons.level - a.research.weapons.level)[0].research.weapons.level;
        let defenderBonus = this.getDefenderBonus(game, star);

        let buffs: number[] = [];

        if (carriersInOrbit.length) {
            buffs = carriersInOrbit.map(c => this.getCarrierWeaponsBuff(c, true, false, defenders.length, 'anyCarrier', false));
        }

        buffs.push(this.getStarWeaponsBuff(star));

        return this._calculateActualWeaponsBuff(weapons, buffs, defenderBonus);
    }

    getCarriersEffectiveWeaponsLevel(game: Game, players: Player[], carriers: Carrier[], isCarrierToStarCombat: boolean, isAttacker: boolean,  strategy: CombatResolutionMalusStrategy) {
        const weapons = players.sort((a, b) => b.research.weapons.level - a.research.weapons.level)[0].research.weapons.level;

        if (!carriers.length) {
            return weapons;
        }

        const largestCarrierShips = maxBy(c => c.ships || 0, carriers);

        const buffs = carriers.map(c => {
            const isLargest = (c.ships || 0) === (largestCarrierShips || 0);

            return this.getCarrierWeaponsBuff(c, isCarrierToStarCombat, isAttacker, players.length, strategy, isLargest)
        });

        return this._calculateActualWeaponsBuff(weapons, buffs, 0);
    }

    _calculateActualWeaponsBuff(weapons: number, buffs: number[], additionalBuff: number) {
        let buff = Math.max(0, buffs.sort((a, b) => b - a)[0]);
        let debuff = buffs.sort((a, b) => a - b)[0];

        let actualBuff = debuff < 0 ? debuff + buff : buff;

        return Math.max(1, weapons + actualBuff + additionalBuff);
    }   

    getDefenderBonus(game: Game, star: Star) {
        let bonus = game.settings.specialGalaxy.defenderBonus === 'enabled' ? 1 : 0;

        if (star.isAsteroidField) {
            bonus++;
        }

        if (star.specialistId) {
            const specialist = this.specialistService.getByIdStar(star.specialistId);

            if (specialist && specialist.modifiers.special?.defenderBonus) {
                bonus += specialist.modifiers.special.defenderBonus;
            }
        }

        if (star.homeStar) {
            if (this.gameTypeService.isCapitalStarEliminationMode(game)) {
                bonus *= 2;
            } else {
                bonus *= game.constants.star.homeStarDefenderBonusMultiplier;
            }
        }

        return bonus;
    }
}
