# AFK Rules
Players who are away for an extended period of time in games can be **temporarily kicked** from the game and AI takes over.

A player is considered to be AFK if:

1. The player has not been online for X number of days - See the `AFK Last Seen Limit` game setting.
2. In **turn based** games, the player has reached the maximum number of missed turns. - See the `AFK Missed Turn Limit` game setting.
3. The player has not been online for X number of cycles - See the `AFK Galactic Cycle Limit` game setting.

## AFK Slots
A player who has been kicked for being AFK can **rejoin** their own slot at any time, providing it has not been filled by another player.

If a player goes AFK, you can **fill the AFK slot** (as long as you aren't already playing). At the end of the game, **extra rank is awarded** at `1.5x` normal rank (minimum of 0 rank). See [Rankings](./rankings.md) for more details.

## AFK vs. Conceded Defeat
There is a key difference between a player who has **conceded defeat** and a player who has been kicked for being AFK, a player who has conceded has purposefully resigned from the game.

Slots for players who have conceded defeat **cannot be filled** by other players wishing to join the game, only AFK slots can be filled.