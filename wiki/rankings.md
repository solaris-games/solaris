# Game Leaderboard Rankings

When a game ends, rank points are awarded to all players using the following rules:

- The leaderboard is ordered by stars, then by ships, then by carriers, then by defeated date (undefeated ordered above defeated).
- `rank points awarded = (number of players / 2)` - zero based leaderboard position
- For first place its `rank points awarded = number of players`
- AFK players are not awarded positive rank points, they will receieve negative rank points (at least -1).
- Players who have filled AFK slots are awarded x1.5 rank points rounded up (at least 0).

So for example, in a 4 player game:

- 1st place receives 4 rank points.
- 2nd place receives 1 rank points.
- 3rd place receives 0 rank points.
- 4th receives -1 rank points.

Additionally:

- 1st place receives a galactic credit.
- Players who are undefeated and active (not AFK) receive +1 to their completed statistic on their profile.
- Players cannot have less than 0 rank points in their profiles.
- Rank points are not awarded in New Player Games.
- Rank points are not awarded unless the game has completed 3 galactic cycles.

## Rank Insignias
When a player achieves a certain number of rank points, they are awarded with a new rank insignia, this is displayed on the player's profile in game, on the leaderboard and in the player's achievments page. The rank levels are listed below.

|                                                                                                                      | Rank                   | Rank Points Required      |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------- |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/1.png" width="60"> | Ensign                 | 0                         |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/2.png" width="60"> | Junior Lieutenant      | 5                         |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/3.png" width="60"> | Lieutenant             | 10                        |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/4.png" width="60"> | Lieutenant Commander   | 20                        |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/5.png" width="60"> | Commander              | 40                        |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/6.png" width="60"> | Captain                | 80                        |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/7.png" width="60"> | Lower Rear Admiral     | 160                       |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/8.png" width="60"> | Upper Rear Admiral     | 320                       |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/9.png" width="60"> | Vice Admiral           | 640                       |
| <img src="https://raw.githubusercontent.com/solaris-games/solaris/master/client/src/assets/levels/10.png" width="60">| Admiral                | 1280                      |
