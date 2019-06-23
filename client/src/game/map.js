import * as PIXI from 'pixi.js';
import gameContainer from '../game/container';
import Star from './star';
import Background from './background';

class Map {
    constructor() {
        this.container = new PIXI.Container();
    }

    draw(game) {
        // Draw all stars in their positions.
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let star = new Star(this.container);

            star.draw(game.galaxy.stars[i], game.galaxy.players);
        }
    }

    zoomToPlayer(game, player) {
        // Find the home star the player owns.
        let homeStar = game.galaxy.stars.find(x => {
            return x.ownedByPlayerId === player._id && x.economy === 5 // TODO: Need to work out home star.
        });

        gameContainer.viewport.moveCenter(homeStar.location.x, homeStar.location.y);
    }
}

export default new Map();
