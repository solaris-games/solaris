const EventEmitter = require('events');

module.exports = class CombatService extends EventEmitter {
    
    constructor(technologyService, specialistService, playerService, starService, reputationService, diplomacyService) {
        super();

        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.playerService = playerService;
        this.starService = starService;
        this.reputationService = reputationService;
        this.diplomacyService = diplomacyService;
    }

    calculate(defender, attacker, isTurnBased = true, calculateNeeded = false) {    
        let defenderShipsRemaining = defender.ships;
        let attackerShipsRemaining = attacker.ships;

        const defendPower = defender.weaponsLevel;
        const attackPower = attacker.weaponsLevel;
        const defenderAdditionalTurns = isTurnBased ? 1 : 0;
        
        const defenderTurns = Math.ceil(attacker.ships / defendPower);
        const attackerTurns = Math.ceil(defender.ships / attackPower);

        let needed = null;

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

    calculateStar(game, star, owner, defenders, attackers, defenderCarriers, attackerCarriers) {
        // Calculate the combined combat result taking into account
        // the star ships and all defenders vs. all attackers
        let totalDefenders = Math.floor(star.shipsActual) + defenderCarriers.reduce((sum, c) => sum + c.ships, 0);
        let totalAttackers = attackerCarriers.reduce((sum, c) => sum + c.ships, 0);

        // Calculate the weapons tech levels based on any specialists present at stars or carriers.
        let defenderWeaponsTechLevel = this.technologyService.getStarEffectiveWeaponsLevel(game, owner, star, defenderCarriers);
        
        // Use the highest weapons tech of the attacking players to calculate combat result.
        let attackerWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, attackers, attackerCarriers, true);

        // Check for deductions to weapons.
        let defenderWeaponsDeduction = this.technologyService.getCarriersWeaponsDebuff(attackerCarriers);
        let attackerWeaponsDeduction = this.technologyService.getCarriersWeaponsDebuff(defenderCarriers);

        // Note: Must fight with a minimum of 1.
        defenderWeaponsTechLevel = Math.max(defenderWeaponsTechLevel - defenderWeaponsDeduction, 1);
        attackerWeaponsTechLevel = Math.max(attackerWeaponsTechLevel - attackerWeaponsDeduction, 1);

        let combatResult = this.calculate({
            weaponsLevel: defenderWeaponsTechLevel,
            ships: totalDefenders
        }, {
            weaponsLevel: attackerWeaponsTechLevel,
            ships: totalAttackers
        }, true);

        return combatResult;
    }

    calculateCarrier(game, defenders, attackers, defenderCarriers, attackerCarriers) {
        let totalDefenders = defenderCarriers.reduce((sum, c) => sum + c.ships, 0);
        let totalAttackers = attackerCarriers.reduce((sum, c) => sum + c.ships, 0);

        // Calculate the weapons tech levels
        let defenderWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, defenders, defenderCarriers, false);
        let attackerWeaponsTechLevel = this.technologyService.getCarriersEffectiveWeaponsLevel(game, attackers, attackerCarriers, false);
        
        // Check for deductions to weapons.
        let defenderWeaponsDeduction = this.technologyService.getCarriersWeaponsDebuff(attackerCarriers);
        let attackerWeaponsDeduction = this.technologyService.getCarriersWeaponsDebuff(defenderCarriers);

        // Note: Must fight with a minimum of 1.
        defenderWeaponsTechLevel = Math.max(defenderWeaponsTechLevel - defenderWeaponsDeduction, 1);
        attackerWeaponsTechLevel = Math.max(attackerWeaponsTechLevel - attackerWeaponsDeduction, 1);

        let combatResult = this.calculate({
            weaponsLevel: defenderWeaponsTechLevel,
            ships: totalDefenders
        }, {
            weaponsLevel: attackerWeaponsTechLevel,
            ships: totalAttackers
        }, false);

        return combatResult;
    }

    async performCombat(game, gameUsers, defender, star, carriers) {
        // NOTE: If star is null then the combat mode is carrier-to-carrier.

        // Allies of the defender will be on the defending side.
        let defenderAllies = [];

        if (this.diplomacyService.isFormalAlliancesEnabled(game)) {
            defenderAllies = this.diplomacyService.getAlliesOfPlayer(game, defender);
        }

        // Get all defender carriers ordered by most carriers present descending.
        // Carriers who have the most ships will be target first in combat.
        let defenderCarriers = carriers
            .filter(c => 
                c.ships > 0
                && !c.isGift
                && (c.ownedByPlayerId.equals(defender._id) || defenderAllies.find(a => a._id.equals(c.ownedByPlayerId)))  // Either owned by the defender or owned by an ally
            )
            .sort((a, b) => b.ships - a.ships);

        // If in carrier-to-carrier combat, verify that there are carriers that can fight.
        if (!star && !defenderCarriers.length) {
            return;
        }

        // Get all attacker carriers.
        let attackerCarriers = carriers
            .filter(c => 
                c.ships > 0 
                && !c.isGift 
                && !c.ownedByPlayerId.equals(defender._id)    // Not owned by the player and
                && !defenderAllies.find(a => a._id.equals(c.ownedByPlayerId))   // Not owned by an ally
            )
            .sort((a, b) => b.ships - a.ships);

        // Double check that the attacking carriers can fight.
        if (!attackerCarriers.length) {
            return;
        }

        // Get the players for the defender and all attackers.
        let defenderPlayerIds = defenderCarriers.map(c => c.ownedByPlayerId.toString());
        defenderPlayerIds.push(defender._id.toString());
        defenderPlayerIds = [...new Set(defenderPlayerIds)];

        let attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId.toString()))];

        let defenders = defenderPlayerIds.map(playerId => this.playerService.getById(game, playerId));
        let attackers = attackerPlayerIds.map(playerId => this.playerService.getById(game, playerId));

        let defenderUsers = [];
        let attackerUsers = [];
        
        for (let defender of defenders) {
            let user = gameUsers.find(u => u._id.equals(defender.userId));
            
            if (user) {
                defenderUsers.push(user);
            }
        }
        
        for (let attacker of attackers) {
            let user = gameUsers.find(u => u._id.equals(attacker.userId));
            
            if (user) {
                attackerUsers.push(user);
            }
        }

        // Perform combat at the star.
        let combatResult;
        
        if (star) {
            combatResult = this.calculateStar(game, star, defender, defenders, attackers, defenderCarriers, attackerCarriers);
        } else {
            combatResult = this.calculateCarrier(game, defenders, attackers, defenderCarriers, attackerCarriers);
        }

        // Add all of the carriers to the combat result with a snapshot of
        // how many ships they had before combat occurs.
        // We will update this as we go along with combat.
        combatResult.carriers = carriers.map(c => {
            let specialist = this.specialistService.getByIdCarrierTrim(c.specialistId);

            return {
                _id: c._id,
                name: c.name,
                ownedByPlayerId: c.ownedByPlayerId,
                specialist,
                before: c.ships,
                lost: 0,
                after: c.ships
            };
        });

        if (star) {
            let specialist = this.specialistService.getByIdStarTrim(star.specialistId);

            // Do the same with the star.
            combatResult.star = {
                _id: star._id,
                ownedByPlayerId: star.ownedByPlayerId,
                specialist,
                before: Math.floor(star.shipsActual),
                lost: 0,
                after: Math.floor(star.shipsActual)
            };
        }

        let defenderObjects = [...defenderCarriers];

        if (star) {
            defenderObjects.push(star);
        }

        // Distribute damage evenly across all objects that are involved in combat.
        this._distributeDamage(combatResult, attackerCarriers, combatResult.lost.attacker);
        this._distributeDamage(combatResult, defenderObjects, combatResult.lost.defender);

        this._updatePlayersCombatAchievements(combatResult, defenders, defenderUsers, defenderCarriers, attackers, attackerUsers, attackerCarriers);

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
        let captureResult = null;

        if (star) {
            captureResult = this._starDefeatedCheck(game, star, defender, defenders, defenderUsers, defenderCarriers, attackers, attackerUsers, attackerCarriers);
        }

        // Deduct reputation for all attackers that the defender is fighting and vice versa.
        for (let defenderPlayer of defenders) {
            for (let attackerPlayer of attackers) {
                await this.reputationService.decreaseReputation(game, defenderPlayer, attackerPlayer, true, false);
                await this.reputationService.decreaseReputation(game, attackerPlayer, defenderPlayer, true, false);
            }
        }

        // Log the combat event
        if (star) {
            this.emit('onPlayerCombatStar', {
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
            this.emit('onPlayerCombatCarrier', {
                gameId: game._id,
                gameTick: game.state.tick,
                defenders,
                attackers,
                combatResult
            });
        }

        // If there are still attackers remaining, recurse.
        attackerPlayerIds = [...new Set(attackerCarriers.map(c => c.ownedByPlayerId.toString()))];

        if (attackerPlayerIds.length > 1) {
            // Get the next player to act as the defender.
            if (star) {
                defender = this.playerService.getById(game, star.ownedByPlayerId);
            } else {
                defender = this.playerService.getById(game, attackerPlayerIds[0]);
            }

            await this.performCombat(game, gameUsers, defender, star, attackerCarriers);
        }

        return combatResult;
    }

    _starDefeatedCheck(game, star, owner, defenders, defenderUsers, defenderCarriers, attackers, attackerUsers, attackerCarriers) {
        let starDefenderDefeated = star && !Math.floor(star.shipsActual) && !defenderCarriers.length;
        let hasAttackersRemaining = attackerCarriers.reduce((sum, c) => sum + c.ships, 0) > 0;
        let hasCapturedStar = starDefenderDefeated && hasAttackersRemaining;

        if (hasCapturedStar) {
            return this.starService.captureStar(game, star, owner, defenders, defenderUsers, attackers, attackerUsers, attackerCarriers);
        }

        return null;
    }

    _distributeDamage(combatResult, damageObjects, shipsToKill) {
        while (shipsToKill) {
            let objectsToDeduct = damageObjects.filter(c => c.ships);

            // Try to distribute damage evenly across all objects, minimum of 1.
            let shipsPerObject = Math.max(1, Math.floor(shipsToKill / objectsToDeduct.length));

            for (let obj of objectsToDeduct) {
                let combatObject = combatResult.carriers.find(c => c._id.equals(obj._id)) || combatResult.star;

                // Calculate how many ships to kill, capped to however many ships the object has.
                let killed = Math.min(obj.ships, shipsPerObject);

                combatObject.after -= killed;
                combatObject.lost += killed;
                shipsToKill -= killed;

                // Apply damage to the carrier or star.
                if (obj.shipsActual == null) {
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
    }

    _updatePlayersCombatAchievements(combatResult, defenders, defenderUsers, defenderCarriers, attackers, attackerUsers, attackerCarriers) {
        let defenderCarriersDestroyed = defenderCarriers.filter(c => !c.ships).length;
        let defenderSpecialistsDestroyed = defenderCarriers.filter(c => !c.ships && c.specialistId).length;

        let attackerCarriersDestroyed = attackerCarriers.filter(c => !c.ships).length;
        let attackerSpecialistsDestroyed = attackerCarriers.filter(c => !c.ships && c.specialistId).length;

        // Add combat result stats to defender achievements.
        for (let defenderUser of defenderUsers) {
            let defender = defenders.find(u => u.userId === defenderUser._id.toString());

            if (defender && !defender.defeated) {
                let playerCarriers = defenderCarriers.filter(c => c.ownedByPlayerId.equals(defender._id));

                defenderUser.achievements.combat.kills.ships += combatResult.lost.attacker;
                defenderUser.achievements.combat.kills.carriers += attackerCarriersDestroyed;
                defenderUser.achievements.combat.kills.specialists += attackerSpecialistsDestroyed;
                
                defenderUser.achievements.combat.losses.ships += combatResult.lost.defender; // TODO: This will not be correct in combat where its more than 2 players.
                defenderUser.achievements.combat.losses.carriers += playerCarriers.filter(c => !c.ships).length;
                defenderUser.achievements.combat.losses.specialists += playerCarriers.filter(c => !c.ships && c.specialistId).length;
            }
        }

        // Add combat result stats to attacker achievements.
        for (let attackerUser of attackerUsers) {
            let attacker = attackers.find(u => u.userId === attackerUser._id.toString());

            if (attacker && !attacker.defeated) {
                let playerCarriers = attackerCarriers.filter(c => c.ownedByPlayerId.equals(attacker._id));

                attackerUser.achievements.combat.kills.ships += combatResult.lost.defender;
                attackerUser.achievements.combat.kills.carriers += defenderCarriersDestroyed;
                attackerUser.achievements.combat.kills.specialists += defenderSpecialistsDestroyed;
                
                attackerUser.achievements.combat.losses.ships += combatResult.lost.attacker; // TODO: This will not be correct in combat where its more than 2 players.
                attackerUser.achievements.combat.losses.carriers += playerCarriers.filter(c => !c.ships).length;
                attackerUser.achievements.combat.losses.specialists += playerCarriers.filter(c => !c.ships && c.specialistId).length;
            }
        }
    }

}
