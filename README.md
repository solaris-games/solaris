# Solaris

Solaris is a slow-burn browser game heavily inspired by [Neptune's Pride](https://np.ironhelmet.com) and [Subterfuge](http://subterfuge-game.com/).

![](client/src/assets/screenshots/game1.png)

- Build economic, industrial and scientific infrastructure to improve your empire.
- Build carriers to travel to new stars or to fight your enemies.
- Research new technologies to gain an edge over your opponents.
- Hire specialists which grant special abilities to stars and carriers like increased weapons and speed.
- Set up trade with your allies to get ahead of the curve.
- Play games with up to 32 players at a time.
- Participate in group chats with your allies to discuss strategy.
- Fight other players and capture stars to win the game.
- Games last around 2-3 weeks, and you don't need to commit a lot of time to play!
- Play on any device that has a web browser.
- Its completely free!

Visit [solaris.games](https://solaris.games) to play now!

### Server
The server uses the following tech:
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
    - [Mongoose](https://mongoosejs.com/)

### Client
The client uses the following tech:
- [Vue.js](https://vuejs.org/)
- [PixiJS](https://www.pixijs.com/)

## Development Environment Setup
1. Install the prerequisites.
    - [Node.js](https://nodejs.org/en/)
    - [MongoDB](https://www.mongodb.com/)
2. Clone the repository.
3. Checkout `master`.
4. `npm install` in both `client/` and `server/` directories.
5. Create a `.env` file in `server/` (See `.env.example`).
6. Create a `.env` file in `client/` (See `.env.example`).
7. `npm run start-jobs` in `server/` to start the automated jobs.
8. `npm run start-api` in `server/` to start the API.
9. `npm run serve` in `client/` to start the client application.
10. Browse to the site locally (default [http://localhost:8080](http://localhost:8080)).

*Note: Development work is to be based on the `master` branch, for a new feature or bug fix, create a branch from `master`.*

### Setup Scripts
See the `scripts/` directory for scripts that will perform the setup automatically.

### Common Fixes
- If you're on Windows and you get an error running `npm install` in `server/` complaining about `node-gyp`, try the following command:
    - `npm install --global --production windows-build-tools`
- If you're using the VS Code debugger, especially for the `server/`, you'll need to set up your `launch.json` with these additional properties:
    - `"envFile": "${workspaceFolder}/server/.env"` in the `configuration`.

## Contributing
See [here](CONTRIBUTING.md).

## License
See [here](LICENSE).
