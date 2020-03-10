# Neptune's Pride Clone

This is an application that aims to loosely clone the game [Neptune's Pride](https://np.ironhelmet.com). It uses the following tech:

#### Server
- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
    - [Mongoose](https://mongoosejs.com/)

#### Client
- [Vue.js](https://vuejs.org/)
- [PixiJS](https://www.pixijs.com/)

## Development Environment Setup
1. Install the prerequisites.
    - [Node.js](https://nodejs.org/en/)
    - [MongoDB](https://www.mongodb.com/)
2. Clone the repository.
3. Checkout `dev`.
4. `npm install` in both `client/` and `server/` directories.
5. Create a `.env` file in `server/` (See `.env.example`).
6. `npm start` in `server/`
7. `npm run serve` in `client/`
8. Browse to the site locally (default [http://localhost:8080](http://localhost:8080)).

*Note: Development work is to be based on the `dev` branch, for a new feature or bug fix, create a branch from `dev`.*

## Contributing
See [here](CONTRIBUTING.md).

## License
See [here](LICENSE).