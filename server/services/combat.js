

module.exports = class CombatService {
    
    constructor(technologyService, specialistService) {
        this.technologyService = technologyService;
        this.specialistService = specialistService;
    }

    calculate(defender, attacker, calculateNeeded = false) {    
        let defenderShipsRemaining = defender.ships;
        let attackerShipsRemaining = attacker.ships;

        const defendPower = defender.weaponsLevel;
        const attackPower = attacker.weaponsLevel;
        
        const defenderTurns = Math.ceil(attacker.ships / defendPower);
        const attackerTurns = Math.ceil(defender.ships / attackPower);

        let needed = null;

        if (defenderTurns <= attackerTurns)  {
            attackerShipsRemaining = 0;
            defenderShipsRemaining = defender.ships - (defenderTurns - 1) * attackPower;

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
                    defender: (defenderTurns - 1) * attackPower + 1
                };
            }
        }

        attackerShipsRemaining = Math.max(0, attackerShipsRemaining);
        defenderShipsRemaining = Math.max(0, defenderShipsRemaining);

        let result = {
            weapons: {
                defender: defendPower,
                attacker: attackPower
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

    calculateStar(game, star, defender, attackers, defenderCarriers, attackerCarriers) {
        // Calculate the combined combat result taking into account
        // the star garrison and all defenders vs. all attackers
        let totalDefenders = Math.floor(star.garrisonActual) + defenderCarriers.reduce((sum, c) => sum + c.ships, 0);
        let totalAttackers = attackerCarriers.reduce((sum, c) => sum + c.ships, 0);

        // Calculate the weapons tech levels based on any specialists present at stars or carriers.
        let defenderWeaponsTechLevel = this.technologyService.getStarEffectiveWeaponsLevel(game, defender, star, defenderCarriers);
        
        // Add the defender bonus if applicable.
        defenderWeaponsTechLevel += this.getDefenderBonus(game);

        // Use the highest weapons tech of the attacking players to calculate combat result.
        let attackerWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, attackers, attackerCarriers, true);

        // Check for deductions to weapons.
        let defenderWeaponsDeduction = this.getWeaponsDeduction(attackerCarriers, defenderCarriers);
        let attackerWeaponsDeduction = this.getWeaponsDeduction(defenderCarriers, attackerCarriers);

        // Note: Must fight with a minimum of 1.
        defenderWeaponsTechLevel = Math.max(defenderWeaponsTechLevel - defenderWeaponsDeduction, 1);
        attackerWeaponsTechLevel = Math.max(attackerWeaponsTechLevel - attackerWeaponsDeduction, 1);

        let combatResult = this.calculate({
            weaponsLevel: defenderWeaponsTechLevel,
            ships: totalDefenders
        }, {
            weaponsLevel: attackerWeaponsTechLevel,
            ships: totalAttackers
        });

        return combatResult;
    }

    calculateCarrier(game, defender, attackers, defenderCarriers, attackerCarriers) {
        let totalDefenders = defenderCarriers.reduce((sum, c) => sum + c.ships, 0);
        let totalAttackers = attackerCarriers.reduce((sum, c) => sum + c.ships, 0);

        // Calculate the weapons tech levels
        let defenderWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, [defender], defenderCarriers, false);
        let attackerWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, attackers, attackerCarriers, false);
        
        // Add the defender bonus if applicable.
        defenderWeaponsTechLevel += this.getDefenderBonus(game);
        
        // Check for deductions to weapons.
        let defenderWeaponsDeduction = this.getWeaponsDeduction(attackerCarriers, defenderCarriers);
        let attackerWeaponsDeduction = this.getWeaponsDeduction(defenderCarriers, attackerCarriers);

        // Note: Must fight with a minimum of 1.
        defenderWeaponsTechLevel = Math.max(defenderWeaponsTechLevel - defenderWeaponsDeduction, 1);
        attackerWeaponsTechLevel = Math.max(attackerWeaponsTechLevel - attackerWeaponsDeduction, 1);

        let combatResult = this.calculate({
            weaponsLevel: defenderWeaponsTechLevel,
            ships: totalDefenders
        }, {
            weaponsLevel: attackerWeaponsTechLevel,
            ships: totalAttackers
        });

        return combatResult;
    }

    getDefenderBonus(game) {
        return game.settings.specialGalaxy.defenderBonus === 'enabled' ? 1 : 0;
    }

    getWeaponsDeduction(carriersToCheck) {
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
    
}
