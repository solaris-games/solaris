# AI Reputation

When playing against the AI, interactions between you and the AI will result in **reputation** changes. Reputation is how the AI feels about your empire, the maximum reputation is 8 and the minimum is -8.

Reputation can be increased by:

- Sending **credits** - Where credit amount is `ai total economy * 10 / 2`.
- Sending **specialist tokens** - Where token amount is `round(ai specialist tech level / 2)`.
- Sending **technology** - Any amount of technology.

Reputation will be decreased by **combat**. If your reputation is **greater than** `0`, it will reset to `0`. So for example if your reputation is `8` and you attack the AI, it will reset to `0`. Otherwise the reputation will decrease by `1` whilst below `0`.

*Note: Reputation is always tracked even for players who are not AI. This ensures that if a player is defeated/afk then their reputation is consistent with their actions.*

## Diplomacy

The AI will automatically declare their **diplomatic status** to you when reputation changes. These are as follows:

- **Allies** - Reputation is `>= 5`.
- **Neutral** - Reputation is `< 5 and >= 0`.
- **Enemies** - Reputation is `< 0`.

*Pro tip: Take advantage of AI diplomacy to include them in combat on your side and visit their stars if they are allies.*

For **non-AI** players, any **decrease** in reputation is a declaration of war. If the players are neutral they will **declare war** on eachother.
