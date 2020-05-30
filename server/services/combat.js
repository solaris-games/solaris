

module.exports = class CombatService {
    
    calculate(defender, attacker) {
        let defenderShipsRemaining = defender.ships,
            attackerShipsRemaining = attacker.ships;

        let defendPower = defender.weaponsLevel + 1,
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

}
