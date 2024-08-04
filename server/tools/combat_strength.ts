import {Attacker, CombatPart, CombatResultShips, Defender} from "../services/types/Combat";
import fs from "fs";

const calculateCombatClassic = (defender: Defender, attacker: Attacker, isTurnBased: boolean = true, calculateNeeded: boolean = false): CombatResultShips => {
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

    const defenderTurns = Math.ceil(attacker.ships / defendPower); // turns until defender has killed attacker
    const attackerTurns = Math.ceil(defender.ships / attackPower); // turns until attacker has killed defender

    let needed: CombatPart | null = null;

    if (defenderTurns <= attackerTurns)  {
        attackerShipsRemaining = 0;
        defenderShipsRemaining = defender.ships - (defenderTurns - defenderAdditionalTurns) * attackPower; // defender gains 1 turn where they do not lose ships

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

const calculateCombatWithStrength = (defender: Defender, attacker: Attacker, isTurnBased: boolean = true, calculateNeeded: boolean = false): CombatResultShips => {
    let defenderShipsRemaining = defender.ships;
    let attackerShipsRemaining = attacker.ships;

    let defendPowerBase = defender.weaponsLevel;
    let attackPowerBase = attacker.weaponsLevel;
    let defendPower = defender.weaponsLevel;
    let attackPower = attacker.weaponsLevel;

    const defenderBonusStrength = isTurnBased ? (attackPower * defendPower) : 0;
    let attackerStrength = attackPower * attacker.ships;
    let defenderStrength = defendPower * defender.ships + defenderBonusStrength;

    let resultAttackerStrength = Math.max(0, attackerStrength - defenderStrength);
    let resultDefenderStrength = Math.max(0, defenderStrength - attackerStrength);

    attackerShipsRemaining = Math.floor(resultAttackerStrength / attackPower);

    if (isTurnBased) {
        defenderShipsRemaining = Math.floor(resultDefenderStrength / defendPower);
    } else {
        defenderShipsRemaining = Math.floor(resultDefenderStrength / defendPower);
    }

    return {
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
}

const combos = [
    [1, 1, 1, 1],
    [1, 1, 2, 1],
    [1, 1, 1, 2],
    [10, 1, 10, 1],
    [10, 1, 10, 2],
    [10, 2, 10, 2],
    [50, 1, 50, 1],
    [50, 1, 50, 2],
    [50, 2, 50, 2],
    [10, 3, 10, 3],
    [10, 3, 10, 4],
    [5, 2, 5, 1],
    [20, 2, 10, 2],
    [50, 3, 10, 3],
    [50, 4, 10, 2],
    [20, 2, 50, 4],
    [10, 6, 10, 6],
    [50, 6, 50, 6],
    [100, 10, 100, 10],
    [100, 10, 100, 13],
    [200, 10, 100, 10],
    [100, 5, 100, 6]
]

const SHIP_COUNTS = [1, 2, 3, 5, 10, 20, 40, 60, 100, 200, 500, 1000, 2000];

const WEAPONS_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];

const results = [];

const significantDifference = (a, b) => {
    return Math.abs(a - b) > 1;
}

for (const shipA of SHIP_COUNTS) {
    for (const shipB of SHIP_COUNTS) {
        for (const weaponsA of WEAPONS_LEVELS) {
            for (const weaponsB of WEAPONS_LEVELS) {
                const result1 = calculateCombatClassic({ships: shipB, weaponsLevel: weaponsB}, {ships: shipA, weaponsLevel: weaponsA}, true, false);
                const result2 = calculateCombatClassic({ships: shipB, weaponsLevel: weaponsB}, {ships: shipA, weaponsLevel: weaponsA}, false, false);
                const result3 = calculateCombatWithStrength({ships: shipB, weaponsLevel: weaponsB}, {ships: shipA, weaponsLevel: weaponsA}, true, false);
                const result4 = calculateCombatWithStrength({ships: shipB, weaponsLevel: weaponsB}, {ships: shipA, weaponsLevel: weaponsA}, false, false);

                const allResult = {
                    shipA,
                    weaponsA,
                    shipB,
                    weaponsB,
                    classicC2SAttacker: result1.after.attacker,
                    classicC2SDefender: result1.after.defender,
                    classicC2CAttacker: result2.after.attacker,
                    classicC2CDefender: result2.after.defender,
                    strengthC2SAttacker: result3.after.attacker,
                    strengthC2SDefender: result3.after.defender,
                    strengthC2CAttacker: result4.after.attacker,
                    strengthC2CDefender: result4.after.defender
                }

                if (significantDifference(allResult.classicC2CDefender, allResult.strengthC2CDefender) ||
                    significantDifference(allResult.classicC2CAttacker, allResult.strengthC2CAttacker) ||
                    significantDifference(allResult.classicC2SDefender, allResult.strengthC2SDefender) ||
                    significantDifference(allResult.classicC2SAttacker, allResult.strengthC2SAttacker)) {
                    results.push(allResult);
                }
            }
        }
    }
}

for (const [shipA, weaponsA, shipB, weaponsB] of combos) {

}

let csv = 'Ships A,Weapons A,Ships B,Weapons B,Classic C2S attacker,Classic C2S defender,Classic C2C attacker,Classic C2C defender,Strength C2S attacker,Strength C2S defender,Strength C2C attacker,Strength C2C defender\n';

for (const result of results) {
    csv += `${result.shipA},${result.weaponsA},${result.shipB},${result.weaponsB},${result.classicC2SAttacker},${result.classicC2SDefender},${result.classicC2CAttacker},${result.classicC2CDefender},${result.strengthC2SAttacker},${result.strengthC2SDefender},${result.strengthC2CAttacker},${result.strengthC2CDefender}\n`;
}

fs.writeFileSync('combat_strength.csv', csv);
