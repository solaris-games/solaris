import * as PIXI from 'pixi.js';
import Carrier from './carrier';
import EventEmitter from 'events';

class Star extends EventEmitter {
    constructor(container) {
        super();
        
        this.container = container;

        this.starContainer = new PIXI.Container();
        this.starContainer.buttonMode = true;
        this.starContainer.interactive = true;
        this.starContainer.on('click', this.onClicked.bind(this));

        this.isSelected = false;

        this.container.addChild(this.starContainer);
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

    _isOutOfScanningRange() {
        // These may be undefined, if so it means that they are out of scanning range.
        return typeof this.data.economy === 'undefined' || 
            typeof this.data.industry === 'undefined' || 
            typeof this.data.science === 'undefined';
    }

    setup(data, players) {
        this.data = data;
        this.players = players;
    }

    draw() {
        this.starContainer.removeChildren();

        this.drawColour();

        // If the star has a carrier, draw that instead of the star circle.
        if (this._getStarCarriers().length)
            this.drawCarrier();
        else
            this.drawStar();

        this.drawHalo();
        this.drawName();
        this.drawGarrison();
        //this.drawPlayerName();
        
        if (this.isSelected) {
            this.drawInfrastructure();
            this.drawScanningRange();
        }
    }

    drawStar() {
        let graphics = new PIXI.Graphics();

        if (this._isOutOfScanningRange()) {
            graphics.lineStyle(1, 0xFFFFFF);
            graphics.beginFill(0x000000);
        } else {
            graphics.lineStyle(0);
            graphics.beginFill(0xFFFFFF);
        }

        graphics.drawCircle(this.data.location.x, this.data.location.y, 3);
        graphics.endFill();

        this.starContainer.addChild(graphics);
    }

    drawColour() {
        // Get the player who owns the star.
        let player = this._getStarPlayer();
        
        if (!player)
            return;
            
        let graphics = new PIXI.Graphics();

        graphics.lineStyle(2, player.colour.value);
        graphics.drawCircle(this.data.location.x, this.data.location.y, 6);

        this.starContainer.addChild(graphics);
    }

    drawCarrier() {
        let starCarriers = this._getStarCarriers();

        if (!starCarriers.length)
            return;
            
        let carrier = new Carrier(this.starContainer, starCarriers[0]);

        carrier.draw();
    }

    drawHalo() {
        let graphics = new PIXI.Graphics();

        graphics.lineStyle(1, 0xFFFFFF, 0.1);
        graphics.drawCircle(this.data.location.x, this.data.location.y, this.data.naturalResources / 2);

        this.starContainer.addChild(graphics);
    }

    drawName() {
        let text = new PIXI.Text(this.data.name, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 6;
        text.resolution = 10;

        this.starContainer.addChild(text);
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

        this.starContainer.addChild(text);
    }

    drawInfrastructure() {
        if (!this.data.ownedByPlayerId) return; // TODO Does abandoning stars destroy ALL infrastructure?
        if (this._isOutOfScanningRange()) return;

        let text = new PIXI.Text(`${this.data.economy} ${this.data.industry} ${this.data.science}`, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y - 18;
        text.resolution = 10;

        this.starContainer.addChild(text);
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

        this.starContainer.addChild(text);
    }

    drawScanningRange() {
        // Get the player who owns the star.
        let player = this._getStarPlayer();
        
        if (!player)
            return;
            
        let graphics = new PIXI.Graphics();

        let radius = ((player.research.scanning || 1) + 4) * 10;

        graphics.lineStyle(1, 0xFFFFFF, 0.2);
        graphics.drawStar(this.data.location.x, this.data.location.y, radius, radius, radius - 1);

        this.starContainer.addChild(graphics);
    }

    onClicked(e) {
        this.isSelected = !this.isSelected;

        this.emit('onSelected', this);
    }
}

export default Star;
