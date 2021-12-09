## Custom Galaxies

Solaris supports custom galaxies, you can choose to define how you want the map to look and where stars are placed on the map. This includes star infrastructure, natural resources, warp gates, nebulas etc.

The **Solaris API** is available to public use, below details how to create a game with a custom galaxy.

### Authenticating with Solaris API

The create game API request requires an authentication token, you can find this in a cookie which is set on login. The easiest way to find this is as follows:

In Chrome:

1. Open the Developer Tools -> Network.
2. Log into your account.
3. Look at the `login` API request and find the `Set-Cookie` **Response Header**.
4. Copy the `connect.sid` cookie and value: `connect.sid=...` (Including the `connect.sid=` part), this is your token.

### Setting up the Galaxy Map Data

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
            "isBlackHole": boolean | null,
            "wormHoleToStarId": number | null,
            "specialistId": number | null
        },
        ... More stars
    ]
}
```

See [here](../server/config/game/settings/user/customGalaxy/galaxy.json) for an example template.

*Note: The galaxy must respect any game settings, for example if the `starsPerPlayer` is `10` then 10 stars for each player must be present in the custom galaxy map definition.*

### Creating a game via the Solaris API

Now that you have a token, you will need to use it to send a `POST` request to the Solaris API. It is recommended to use a tool like [Postman](https://www.postman.com/) to initiate requests.

In Postman:

1. Create a new `POST` request to `https://solaris.games/api/game`.
2. Set the `Cookie` header to your token: `connect.sid=...`.
3. Set a **JSON** body with the create game object, see [here](../server/config/game/settings/user/customGalaxy/settings.json) for an example template.
4. Fill in the `customJSON` attribute with the **escaped** JSON string you set up in the section above.
5. Send the request to the API.

*Note: For custom galaxies some of the game settings are bypassed, for example the `playerDistribution` and `resourceDistribution` are not applicable to custom galaxies and are therefore ignored.*

If all went well the API should respond with the **ID** of the game, you can quickly navigate to the game you just created via this url: `https://solaris.games/#/game?id=GAME_ID_HERE`.

If the API responded with errors, fix them and try again. If issues persist, contact a developer for support.