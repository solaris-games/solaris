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
        return game.settings.technology.researchCosts[techKey] !== 'none';
    }

    _applyTechModifiers(techs, modifiers, sanitize = true) {
        techs.scanning += modifiers.scanning || 0;
        techs.hyperspace += modifiers.hyperspace || 0;
        techs.terraforming += modifiers.terraforming || 0;
        techs.experimentation += modifiers.experimentation || 0;
        techs.weapons += modifiers.weapons || 0;
        techs.banking += modifiers.banking || 0;
        techs.manufacturing += modifiers.manufacturing || 0;
        
        if (sanitize) {
            techs.scanning = Math.max(1, techs.scanning);
            techs.hyperspace = Math.max(1, techs.hyperspace);
            techs.terraforming = Math.max(1, techs.terraforming);
            techs.experimentation = Math.max(1, techs.experimentation);
            techs.weapons = Math.max(1, techs.weapons);
            techs.banking = Math.max(1, techs.banking);
            techs.manufacturing = Math.max(1, techs.manufacturing);
        }

        return techs;
    }

    getPlayerEffectiveTechnologyLevels(game, player, sanitize = true) {
        let techs = {
            scanning: player.research.scanning.level,
            hyperspace: player.research.hyperspace.level,
            terraforming: player.research.terraforming.level,
            experimentation: player.research.experimentation.level,
            weapons: player.research.weapons.level,
            banking: player.research.banking.level,
            manufacturing: player.research.manufacturing.level
        };

        // TODO: Global effects needs to be split into different types.
        // i.e global for the player (all stars and all carriers), global for all stars, and global for all carriers.
        
        // // Add global effects of stars.
        // let stars = game.galaxy.stars.filter(s => s.specialistId != null && s.ownedByPlayerId && s.ownedByPlayerId.equals(player._id));

        // for (let star of stars) {
        //     let specialist = this.specialistService.getByIdStar(star.specialistId);

        //     if (specialist.modifiers.global != null) {
        //         this._applyTechModifiers(techs, specialist.modifiers.global, sanitize);
        //     }
        // }

        // // Add global effects of carriers.
        // let carriers = game.galaxy.carriers.filter(s => s.specialistId != null && s.ownedByPlayerId && s.ownedByPlayerId.equals(player._id));

        // for (let carrier of carriers) {
        //     let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

        //     if (specialist.modifiers.global != null) {
        //         this._applyTechModifiers(techs, specialist.modifiers.global, sanitize);
        //     }
        // }

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

    getCarrierEffectiveTechnologyLevels(game, carrier, sanitize = true) {
        let player = game.galaxy.players.find(x => x._id.equals(carrier.ownedByPlayerId));

        let techs = this.getPlayerEffectiveTechnologyLevels(game, player, false);

        if (carrier.specialistId) {
            let specialist = this.specialistService.getByIdCarrier(carrier.specialistId);

            if (specialist.modifiers.local != null) {
                this._applyTechModifiers(techs, specialist.modifiers.local, sanitize);
            }
        }

        return techs;
    }

    getCarriersEffectiveWeaponsLevel(game, carriers) {
        if (!carriers.length) {
            return 1;
        }

        // Get the max tech level of all carriers in the array.
        let techLevels = carriers.map(c => this.getCarrierEffectiveTechnologyLevels(game, c).weapons);

        return techLevels.sort((a, b) => b - a)[0];
    }

}