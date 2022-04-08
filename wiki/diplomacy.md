# Diplomacy

Diplomacy plays a huge role in [Solaris](https://solaris.games), the key to victory is not only galactic conquest, but also building relations with allies. You may first want to establish an alliance early on in the game to gain an advantage.

You should build trade agreements with other players, there will almost certainly be other players and alliances who will have trade agreements and it is important to keep up with these players' technology levels otherwise you will be at a disadvantage.

It may prove to be useful to become the sole player who has a large technology lead of a single technology. For example if you have the highest Weapons technology then other players will want to trade with you and may want to stay friendly with you.

Be aware that other players may be plotting to destroy your empire, especially if you have a lead or are relatively weak. Remember to keep communications open and your borders protected from unwanted aggression.

## Diplomatic Statuses


## Alliances

Your diplomatic status to other players can be changed in the **Menu -> Diplomacy** (hotkey D) screen. The diplomatic statuses are:

- **Neutral** - Default state - If combat occurs then war will be declared.
- **Allies** - Allies have more benefits compared to neutral players, more information below.
- **Enemies** - At war.

The **enemy** status has no gameplay difference from the **neutral** status and currently exists purely to help players see who they're negatively interacting with at a glance.

If both you and another player set each other to **allies** then you both will receive the following benefits:

- You may visit allied stars.
- If all players at a star are **allies** with the star owner, combat will not occur.
- When in orbit at an allied star, your scanning range will take effect.
- When more than 1 player is in orbit at a star, the star indicator will display a `+` suffix. For example: `100/1+` means that the star has 100 ships with 1 carrier in orbit where the carrier is not owned by the player who owns the star.

**Warning** - An alliance can be broken at any time and combat will occur at contested stars.

### Extended Alliance Settings

- **Alliance Only Trading** - If enabled, this setting limits trade to players in alliances.
- **Max Alliances** - If set, the total number of alliances that can be established is limited.
- **Alliance Upkeep** - Establishing an alliance will incur an upfront upkeep fee as well as an upkeep cost at the end of the cycle based on your cycle income.

#### Alliance Upkeep

The formula for alliance upkeep is as follows:

```
alliance upkeep per cycle = round(alliance count * cost per ally * total credits from economy)
```

Where `cost per ally` is:

- Cheap = `0.02`
- Standard = `0.05`
- Expensive = `0.10`

*Note: The upfront fee for allying a player is the total upkeep of 1 cycle for that player.*
