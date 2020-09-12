

module.exports = class CombatService {
    
    constructor(technologyService) {
        this.technologyService = technologyService;
    }

    calculate(game, defender, attacker) {
        let defenderBonus = game.settings.specialGalaxy.defenderBonus === 'enabled';
    
        let defenderShipsRemaining = defender.ships,
            attackerShipsRemaining = attacker.ships;

        let defendPower = defender.weaponsLevel + (defenderBonus ? 1 : 0),
            attackPower = attacker.weaponsLevel;
            
        // Keep fighting until either carrier has no ships remaining.
        while (defenderShipsRemaining > 0 && attackerShipsRemaining > 0) {
            // Friendly carrier attacks first with defender bonus.
            attackerShipsRemaining -= defendPower;

            // Enemy carrier attacks next if there are still ships remaining.
            if (attackerShipsRemaining <= 0) {
                break;
            }

            defenderShipsRemaining -= attackPower;
        }

        attackerShipsRemaining = Math.max(0, attackerShipsRemaining)
        defenderShipsRemaining = Math.max(0, defenderShipsRemaining)

        return {
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
    }

    calculateStar(game, star, defender, attackers, defenderCarriers, attackerCarriers) {
        // Calculate the combined combat result taking into account
        // the star garrison and all defenders vs. all attackers
        let totalDefenders = Math.floor(star.garrisonActual) + defenderCarriers.reduce((sum, c) => sum + c.ships, 0);
        let totalAttackers = attackerCarriers.reduce((sum, c) => sum + c.ships, 0);

        // Calculate the weapons tech levels based on any specialists present at stars or carriers.
        let defenderWeaponsTechLevel;
        let defenderWeaponsTechLevelStar = this.technologyService.getStarEffectiveTechnologyLevels(game, star).weapons;
        let defenderWeaponsTechLevelCarriers = this.technologyService.getCarriersEffectiveWeaponsLevel(game, defenderCarriers);

        defenderWeaponsTechLevel = Math.max(defenderWeaponsTechLevelStar, defenderWeaponsTechLevelCarriers);
        
        // Use the highest weapons tech of the attacking players to calculate combat result.
        let attackerWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, attackerCarriers);

        let defenderBonus = game.settings.specialGalaxy.defenderBonus === 'enabled';

        let combatResult = this.calculate(game,
        {
            weaponsLevel: defenderWeaponsTechLevel,
            ships: totalDefenders
        }, {
            weaponsLevel: attackerWeaponsTechLevel,
            ships: totalAttackers
        });

        return combatResult;
    }
    
}
