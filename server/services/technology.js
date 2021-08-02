module.exports = class TechnologyService {

    constructor(specialistService) {
        this.specialistService = specialistService;
    }

    getEnabledTechnologies(game) {
        let techs = Object.keys(game.settings.technology.researchCosts).filter(k => {
            return k.match(/^[^_\$]/) != null;
        });

        return techs.filter(t => this.isTechnologyEnabled(game, t));
    }

    isTechnologyEnabled(game, techKey) {
        return game.settings.technology.startingTechnologyLevel[techKey] > 0;
    }

    isTechnologyResearchable(game, technologyKey) {
      return game.settings.technology.researchCosts[technologyKey] !== 'none'
    }

    _applyTechModifiers(techs, modifiers, sanitize = true) {
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

    getPlayerEffectiveTechnologyLevels(game, player, sanitize = true) {
        // TODO: This is a plaster over a bug where in the gameGalaxy service
        // it sets research to null if its in extra dark galaxy but somehow
        // this function is still being called by getStats. Needs investigating...
        if (!player.research) {
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

    getStarEffectiveTechnologyLevels(game, star, sanitize = true) {
        let player = game.galaxy.players.find(x => x._id.equals(star.ownedByPlayerId));

        let techs = this.getPlayerEffectiveTechnologyLevels(game, player, false);

        if (star.specialistId) {
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            if (specialist.modifiers.local != null) {
                this._applyTechModifiers(techs, specialist.modifiers.local, sanitize);
            }
        }

        return techs;
    }

    getCarrierEffectiveTechnologyLevels(game, carrier, isCarrierToStarCombat, sanitize = true) {
        let player = game.galaxy.players.find(x => x._id.equals(carrier.ownedByPlayerId));

        let techs = this.getPlayerEffectiveTechnologyLevels(game, player, false);

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist.modifiers.local != null) {
                this._applyTechModifiers(techs, specialist.modifiers.local, sanitize);

                if (isCarrierToStarCombat === true && specialist.modifiers.local.carrierToStarCombat != null) {
                    this._applyTechModifiers(techs, specialist.modifiers.local.carrierToStarCombat, sanitize);
                }
    
                if (isCarrierToStarCombat === false && specialist.modifiers.local.carrierToCarrierCombat != null) {
                    this._applyTechModifiers(techs, specialist.modifiers.local.carrierToCarrierCombat, sanitize);
                }
            }
        }

        return techs;
    }

    getStarWeaponsBuff(star) {
        if (star.specialistId) {
            let specialist = this.specialistService.getByIdStar(star.specialistId);

            if (specialist.modifiers.local != null) {
                return specialist.modifiers.local.weapons || 0;
            }
        }

        return 0;
    }

    getCarrierWeaponsBuff(carrier, isCarrierToStarCombat) {
        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist.modifiers.local != null) {
                if (isCarrierToStarCombat && specialist.modifiers.local.carrierToStarCombat != null) {
                    return specialist.modifiers.local.carrierToStarCombat.weapons || 0;
                } else if (!isCarrierToStarCombat && specialist.modifiers.local.carrierToCarrierCombat != null) {
                    return specialist.modifiers.local.carrierToCarrierCombat.weapons || 0;
                } else {
                    return specialist.modifiers.local.weapons || 0;
                }
            }
        }

        return 0;
    }

    getCarriersWeaponsDebuff(carriersToCheck) {
        let deduction = 0;
        
        if (!carriersToCheck.length) {
            return 0;
        }
        
        // If any of the carriers have a specialist which deducts enemy weapons
        // then find the one that has the highest deduction.
        deduction = carriersToCheck.map(c => {
            let specialist = this.specialistService.getByIdCarrier(c.specialistId);

            if (specialist && specialist.modifiers.special && specialist.modifiers.special.deductEnemyWeapons) {
                return specialist.modifiers.special.deductEnemyWeapons;
            }

            return 0;
        })
        .sort((a, b) => b - a)[0];

        return deduction;
    }

    getStarEffectiveWeaponsLevel(game, player, star, carriersInOrbit) {
        let weapons = player.research.weapons.level;

        let buffs = [];

        if (carriersInOrbit.length) {
            buffs = carriersInOrbit.map(c => this.getCarrierWeaponsBuff(c, true));
        }

        buffs.push(this.getStarWeaponsBuff(star));

        return this._calculateActualWeaponsBuff(weapons, buffs);
    }

    getCarriersEffectiveWeaponsLevel(game, players, carriers, isCarrierToStarCombat) {
        let weapons = players.sort((a, b) => b.research.weapons.level - a.research.weapons.level)[0].research.weapons.level;

        if (!carriers.length) {
            return weapons;
        }

        let buffs = carriers.map(c => this.getCarrierWeaponsBuff(c, isCarrierToStarCombat));

        return this._calculateActualWeaponsBuff(weapons, buffs);
    }

    _calculateActualWeaponsBuff(weapons, buffs) {
        let buff = Math.max(0, buffs.sort((a, b) => b - a)[0]);
        let debuff = buffs.sort((a, b) => a - b)[0];

        let actualBuff = debuff < 0 ? debuff + buff : buff;

        return Math.max(1, weapons + actualBuff);
    }   

}
