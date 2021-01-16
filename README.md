# Solaris

This is a 4X strategy game that aims to loosely clone the game [Neptune's Pride](https://np.ironhelmet.com).

Visit [solaris.games](https://solaris.games) to play now!

![](client/src/assets/screenshots/game1.png)

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
7. `npm start-jobs` in `server/` to start the automated jobs.
8. `npm start-api` in `server/` to start the API.
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
