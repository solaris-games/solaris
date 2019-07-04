import * as PIXI from 'pixi.js';
import gameContainer from './container';
import Star from './star';

class Map {
    constructor() {
        this.container = new PIXI.Container();
    }

    setup(game) {
        this.game = game;

        this.stars = [];

        for (let i = 0; i < this.game.galaxy.stars.length; i++) {
            let star = new Star();

            star.setup(this.game.galaxy.stars[i], this.game.galaxy.players);

            this.stars.push(star);
            
            star.on('onSelected', this.onStarSelected.bind(this));
        }
    }

    draw() {
        this.container.removeChildren();

        this.drawStars();
    }

    drawStars() {
        for(let i = 0; i < this.stars.length - 1; i++) {
            let star = this.stars[i];
            
            this.container.addChild(star.container);

            star.draw();
        }
    }

    zoomToPlayer(game, player) {
        // Find the home star the player owns.
        let homeStar = game.galaxy.stars.find(x => {
            return x.ownedByPlayerId === player._id && x.homeStar === true
        });

        gameContainer.viewport.fitWorld();
        gameContainer.viewport.zoom(-gameContainer.viewport.worldWidth, true);
        gameContainer.viewport.moveCenter(homeStar.location.x, homeStar.location.y);
    }

    zoomToUser(game, userId) {
        let player = game.galaxy.players.find(x => x.userId === userId);

        if (!player) {
            return;
        }

        this.zoomToPlayer(game, player);
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

export default Map;
