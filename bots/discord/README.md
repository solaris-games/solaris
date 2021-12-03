# Solaris Discord Bot
This documentation details how to interact with the Solaris Discord Bot.

## Commands
You can use the following commands in this discord:

- `$gameinfo <galaxy_name> <focus>` - get information about the settings of a galaxy.
- `$help <command>` - get a list of all commands, or more specific information about a command when you add a `<command>`.
- `$leaderboard_global <filter>` - rank players over all games they have played based on certain criteria, like wins, losses, ships killed and more.
- `$leaderboard_local <galaxy_name> <filter>` - rank players in a galaxy based on a certain criteria, like stars, economy, ships and more.
- `$status <galaxy_name>` - get accurate information about the current state of the game, with leaderboard in the most important topics.
- `$userinfo <username> <focus>` - get information about a user, like rank, renown or made economy.

### Game Info
The `$gameinfo <galaxy_name> <focus>` command gives you information about the settings of a completed, in progress or waiting game.

The first direction, the `<galaxy_name>`, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.

The second direction, the `<focus>`, asks what kind of settings you want to know of. There are five kinds of settings.

- If you want to see the general settings, such as the stars required for victory, playerLimit, anonymity and more, use `general`.
- If you want to see the galaxy settings, such as carrier cost, warpgate cost, specialist cost and more, use `galaxy`.
- If you want to see the player settings, such as the starting conditions and trading conditions, use `player`.
- If you want to see the technology settings, such as the starting technologies and their cost, use `technology`.
- If you want to see the time settings, such as the tick/turn duration or whether or not a game is real time, use `time`.

### Game Invite
The `$invite <game_link>` creates an embed message from the game you want promoted. This message contains a summary of the most important settings of a game.

This summary consists of, the gamemode, the anonimity, the dark settings, the maximum amount of players, the amount of stars per player, the galaxy type, the specialist currency, whether trading credits and technology is enabled and what kind of time settings are going on in the game.

For more info on a game, you can use the gameinfo command.

### Global Leaderboard
The `$leaderboard_global <filter> <limit>` command gives you the top `<limit>` within a certain filter.

The limit has to be a value between 1 and 20, the leaderboard will return the top x players, where x is that number.

The filters can be almost anything, the full list of possible filters is: 
- `victories`
- `rank`
- `renown`
- games `joined`
- games `completed`
- games `quit`
- games `defeated`
- games `afk`
- `ships-killed`
- `carriers-killed`
- `specialists-killed`
- `ships-lost`
- `carriers-lost`
- `specialists-lost`
- `stars-captured`
- `stars-lost`
- `home-stars-captured`
- `home-stars-lost`
- `economy` built
- `industry` built
- `science` built
- `warpgates-built`
- `warpgates-destroyed`
- `carriers-built`
- `specialists-hired`
- `scanning` researched
- `hyperspace` range researched
- `terraforming` researched
- `experimentation` researched
- `weapons` researched
- `banking` researched
- `manufacturing` researched
- `specialists` researched
- `credits-sent`
- `credits-received`
- `technologies-sent`
- `technologies-received`
- `ships-gifted`
- `ships-received`
- `renown-sent`
- `elo-rating`

Remember to use the word in the `code-block` as the word for the filter.

### Local Leaderboard
The `$leaderboard_local <galaxy_name> <filter>` gives you a leaderboard of the game you name based on a filter you supplied.

The first direction, the `<galaxy_name>`, is the name of the game you want to know the settings of. You can find this name in the top left of the screen when you are in the game. If however the galaxy name is not unique, you will be asked to use the galaxy-id instead, this is a unique code that can be found at the end of the url when you are in the game.

The second direction, the `<filter>`, is what the leaderboard will be sorted on. The full list of possible filters is:
- total `stars`
- total `carriers`
- total `ships`
- total `economy`
- total `industry`
- total `science`
- `newShip` production
- total `warpgates`
- total `starSpecialists`
- total `carrierSpecialists`
- `totalSpecialists`
- `scanning` level
- `hyperspace` range level
- `terraforming` level
- `experimentation` level
- `weapons` level
- `banking` level
- `manufacturing` level
- `specialists` level.

Remember to use the word in the `code-block` as the word for the filter.

### Game Status
The `$status <gamename>` gives you information about the current status of the game you are looking up.

This includes the following statistics:
- Whether it has finished
- Current tick
- Amount of living players

But also a top 3 on the following leaderboards:
- Total Stars
- Total Ships
- New Ships Produced
- Total Economy
- Total Industry
- Total Science
- Weapons Technology Level
- Manufacturing Technology Level
- Specialists Technology Level

### User Info
The `$userinfo <username> <focus>` gives you a profile of the player with lot's of information. This information can also be found at https://solaris.games/#/account/achievements/`<user_ID>`.

The first direction, the `<username>`, is the name of a user, like The Last Hero, or LimitingFactor, the username is case-sensitive, so make sure to spell it properly.

The second direction, the `<focus>`, is the category you want information on. There are five categories:
- If you want to see information about someone's played games, such as victories, completed games or how often he went afk, use `games`.
- If you want to see information about someone's military accomplishments, such as ships killed, ships lost or stars killed, use `combat`.
- If you want to see information about someone's infrastructure, such as built economy, industry, science and warpgates, use `infrastructure`.
- If you want to see information about someone's research, such as points spent in scanning, hyperspace, terraforming, use `research`.
- If you want to see information about someone's trade history, such as credits sent, technologies sent, ships gifted or even renown gifted, use `trade`.