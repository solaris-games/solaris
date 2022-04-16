# Combat

Combat occurs when a Carrier arrives at an enemy Star or when a Carrier intercepts an enemy Carrier in hyperspace. The combat summary can be viewed in the event log.

![Summary of a combat in the event log](img/combat-summary.png)

When 2 opposing Carriers arrive at a Star on the same tick, the Carrier that travelled the least distance in the current tick will arrive at the Star first and receive the Defender Bonus (if enabled).

Starting with the defender, each player takes it in turns to deal damage to the opposing player. Damage dealt per turn is equal to the effective weapons level, factoring in weapons technology and specialist abilities. Damage is dealt roughly equally to all Carriers and the Star per turn.

If multiple opposing Players are in combat at the same time, they will be split into Attackers and Defenders. Where the defender is the player who owns the star and the attackers are all other players. Combat is repeated until there is one player remaining.

When a Star is captured, all of its Economy is destroyed and the winner is awarded credits (default $10) per point of Economy. Industry, Science, Warp Gates and Star Specialists are undamaged and are captured by the winning player.

Combat can also occur between two carriers. When two carriers from different players intercept each other they will engage in carrier to carrier combat. In carrier to carrier combat there is no defender bonus.

> Note: In carrier to carrier combat, if the either side has **less than or equal ships** than the opposing side's weapons technology level then the carrier(s) will fight with **level 1 weapons**. This prevents players from exploiting 1 ship carriers to chip away at incoming enemy forces.

The combat calculator is a useful tool to predict the outcome of combat. Simply input the defender and attacker's weapons level and number of ships and it will present the outcome.

## Combat Weapons Technology

When specialists with Weapons buffs/debuffs participate in combat, the following rules apply:

```
effective weapons level = max debuff + max buff
```

1. Defender bonus is applied **after** effective weapons level is calculated.
2. Weapon deductions (i.e Infiltrator specialist) is applied **after** effective weapons level is calculated.
3. If multiple specialists with buffs/debuffs participate, then the **highest** buff and **lowest** debuff are used.

For example:

- Specialist A has Weapons +3
- Specialist B has Weapons +1
- Specialist C has Weapons -2
- `effective weapons level = -2 + 3 = +1 weapons` *(Specialist B is ignored)*

## Formal Alliance Combat Rules

When formal alliances is enabled then a there are a few conditions that need to be met in order for combat to take place:

1. When a carrier arrives at a star, if the player is allied with the defender then no combat occurs.
2. When a carrier arrives at a star, if the player is enemies with the defender then combat occurs.
2a. Carriers in orbit who are allied to the defender will help defend.
2b. If the attacker wins and captures the star, then combat will repeat until there are no enemies to the defender.
3. When a carrier intercepts another carrier in space, then combat occurs between enemies.
4. When a player changes their diplomatic status from Allied to Enemy, then combat occurs.

> Note: More than 2 players can be in orbit at the star providing that they are allied with the defender. Combat will not occur if the guest players are enemies but are both allied to the defender.

## Weapon Buffs and Specialists Stacking Example

Scenario:

- **Player A** - `weapons level 11`
    - Defending star:
        - Trade Port - `-5 weapons`
- **Player B** - `weapons level 13`
    - Attacking with carriers:
        - Lieutenant - `+1 weapons`
        - Destroyer - `+5 weapons`
        - Scrambler - `-1 weapons`
        - Infiltrator - `-1 weapons to the enemy`

The combat weapons level resolves to this:

**Player A** - `weapons level 11`:

- Defender bonus = `+1 weapons`
- Largest buff = `N/A`
- Largest debuff = `-5 weapons` (Trade Port)
- Additional debuff = `-1 weapons` (Enemy Infiltrator)
- **Total weapons** = `6`

**Player B** - `weapons level 13`

- Defender bonus = `N/A`
- Largest buff = `+5 weapons` (Destroyer)
- Largest debuff = `-1 weapons` (Scrambler)
- Additional debuff = `N/A`
- **Total weapons** = `17`
