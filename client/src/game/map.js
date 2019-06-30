import * as PIXI from 'pixi.js';
import gameContainer from '../game/container';
import Star from './star';
import Background from './background';

class Map {
    constructor() {
        this.container = new PIXI.Container();
    }

    setup(game) {
        this.game = game;
    }

    draw() {
        this.container.removeChildren();
        this.stars = [];

        // Draw all stars in their positions.
        for (let i = 0; i < this.game.galaxy.stars.length; i++) {
            let star = new Star(this.container);

            star.on('onSelected', this.onStarSelected.bind(this));
            star.setup(this.game.galaxy.stars[i], this.game.galaxy.players);

            star.draw();

            this.stars.push(star);
        }
    }

    zoomToPlayer(game, player) {
        // Find the home star the player owns.
        let homeStar = game.galaxy.stars.find(x => {
            return x.ownedByPlayerId === player._id && x.economy === 5 // TODO: Need to work out home star.
        });

        gameContainer.viewport.moveCenter(homeStar.location.x, homeStar.location.y);
    }

    onStarSelected(e) {
        this.stars
        .filter(s => s.isSelected || s.data._id === e.data._id) // Get only stars that are selected or the e star.
        .forEach(s => {
            // Set all other stars to unselected.
            if (s.data._id !== e.data._id) {
                s.isSelected = false;
            }

            s.draw();
        });
    }

    cleanup() {
        this.stars.forEach(s => s.removeListener('onSelected', this.onStarSelected));
    }
}

export default new Map();
