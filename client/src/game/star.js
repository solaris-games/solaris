import * as PIXI from 'pixi.js';
import Carrier from './carrier';

class Star {
    constructor(container) {
        this.container = container;
    }

    _getStarPlayer() {
        return this.players.find(x => x._id === this.data.ownedByPlayerId);
    }

    _getStarCarriers() {
        // Get the player who owns the star.
        let player = this._getStarPlayer();
                
        if (!player)
            return [];

        let carriersAtStar = player.carriers.filter(x => x.orbiting === this.data._id);

        return carriersAtStar;
    }

    draw(data, players) {
        this.data = data;
        this.players = players;

        this.drawColour();

        // If the star has a carrier, draw that instead of the star circle.
        if (this._getStarCarriers().length)
            this.drawCarrier();
        else
            this.drawStar();

        this.drawHalo();
        this.drawName();
        this.drawGarrison();
        this.drawInfrastructure();
        this.drawPlayerName();
    }

    drawStar() {
        let graphics = new PIXI.Graphics();

        graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        graphics.beginFill(0xFFFFFF);
        graphics.drawCircle(this.data.location.x, this.data.location.y, 3);
        graphics.endFill();

        this.container.addChild(graphics);
    }

    drawColour() {
        // Get the player who owns the star.
        let player = this._getStarPlayer();
        
        if (!player)
            return;
            
        let graphics = new PIXI.Graphics();

        graphics.lineStyle(2, player.colour.value);
        graphics.drawCircle(this.data.location.x, this.data.location.y, 6);

        this.container.addChild(graphics);
    }

    drawCarrier() {
        let starCarriers = this._getStarCarriers();

        if (!starCarriers.length)
            return;
            
        let carrier = new Carrier(this.container, starCarriers[0]);

        carrier.draw();
    }

    drawHalo() {
        let graphics = new PIXI.Graphics();

        graphics.lineStyle(1, 0xFFFFFF, 0.1);
        graphics.drawCircle(this.data.location.x, this.data.location.y, this.data.naturalResources / 2);

        this.container.addChild(graphics);
    }

    drawName() {
        let text = new PIXI.Text(this.data.name, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 6;
        text.resolution = 10;

        this.container.addChild(text);
    }

    drawGarrison() {
        if (!this.data.garrison) return;

        let text = new PIXI.Text(this.data.garrison, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 14;
        text.resolution = 10;

        this.container.addChild(text);
    }

    drawInfrastructure() {
        if (!this.data.ownedByPlayerId) return; // TODO Does abandoning stars destroy ALL infrastructure?
        
        let text = new PIXI.Text(`${this.data.economy} ${this.data.industry} ${this.data.science}`, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y - 18;
        text.resolution = 10;

        this.container.addChild(text);
    }

    drawPlayerName() {
        // Get the player who owns the star.
        let player = this._getStarPlayer();
        
        if (!player)
            return;

        let text = new PIXI.Text(player.alias, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 22;
        text.resolution = 10;

        this.container.addChild(text);
    }
}

export default Star;
