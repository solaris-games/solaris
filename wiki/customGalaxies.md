# Custom Galaxies

Solaris supports custom galaxies, you can choose to define how you want the map to look and where stars are placed on the map. This includes star infrastructure, natural resources, warp gates, nebulas etc.

## Setting up the Galaxy Map Data

To define the custom map, you will need to set up a **JSON Object** containing the map data, it looks like this:

```js
{
    "stars": [
        {
            "id": number | null,        // Required if star is a Worm Hole
            "playerId": number | null,
            "homeStar": boolean | null,
            "location": {
                "x": number,
                "y": number
            },
            "naturalResources": {
                "economy": number,
                "industry": number,
                "science": number
            },
            "warpGate": boolean | null,
            "isNebula": boolean | null,
            "isAsteroidField": boolean | null,
            "isBinaryStar": boolean | null,
            "isBlackHole": boolean | null,
            "isPulsar": boolean | null,
            "wormHoleToStarId": number | null,
            "specialistId": number | null
        },
        ... More stars
    ]
}
```

See [here](https://raw.githubusercontent.com/solaris-games/solaris/master/server/config/game/settings/user/customGalaxyExample.json) for an example template.

*Note: The galaxy must respect any game settings, for example if the `starsPerPlayer` is `10` then 10 stars for each player must be present in the custom galaxy map definition.*

## Creating a Game

After defining what you want the galaxy to look like above, use the **Create Game** page to set up the game:

1. Log into Solaris.
2. Navigate to the **Create Game** page.
3. Select `Custom` in the **Galaxy Type** setting.
4. Paste in the custom galaxy JSON.
5. Fill in the rest of the settings and click **Create Game**.

If all went well the game will have been created, if errors are displayed, fix them and try again. If issues persist, contact a developer for support.

*Note: Custom galaxies must respect any game settings, for example if the `Stars Per Player` is `10` then 10 stars for each player must be present in the custom galaxy map JSON.*