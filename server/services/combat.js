

module.exports = class CombatService {
    
    calculate(defender, attacker) {
        let defenderShips = defender.ships,
            attackerShips = attacker.ships;

        let defendPower = defender.weaponsLevel + 1,
            attackPower = attacker.weaponsLevel;
            
        // Keep fighting until either carrier has no ships remaining.
        while (defenderShips > 0 && attackerShips > 0) {
            // Friendly carrier attacks first with defender bonus.
            attackerShips -= defendPower;

            // Enemy carrier attacks next if there are still ships remaining.
            if (attackerShips <= 0) {
                break;
            }

            defenderShips -= attackPower;
        }

        return {
            defenderShips,
            attackerShips
        };
    }

}
