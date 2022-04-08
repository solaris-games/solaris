# Game Leaderboard Rankings

When a game ends, rank is awarded to all players using the following rules:

- The leaderboard is ordered by stars, then by ships, then by carriers, then by defeated date (undefeated ordered above defeated).
- `rank awarded = (number of players / 2)` - zero based leaderboard position
- For first place its `rank awarded = number of players`
- AFK players are not awarded positive rank, they will receieve negative rank (at least -1).
- Players who have filled AFK slots are awarded 1.5x rank rounded up (at least 0).

So for example, in a 4 player game:

- 1st place receives 4 rank.
- 2nd place receives 1 rank.
- 3rd place receives 0 rank.
- 4th receives -1 rank.

Additionally:

- 1st place receives a galactic credit.
- Players who are undefeated and active (not AFK) receive +1 to their completed statistic on their profile.
- Players cannot have less than 0 rank in their profiles.
- Rank is not awarded in New Player Games.
- Rank is not awarded unless the game has completed 3 galactic cycles.