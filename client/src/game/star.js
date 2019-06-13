import * as PIXI from 'pixi.js';

class Star {
    constructor(container, graphics) {
        this.container = container;
        this.graphics = graphics;
    }

    draw(data) {
        this.data = data;

        this.drawStar();
        this.drawHalo();
        this.drawName();
        this.drawGarrison();
        this.drawInfrastructure();
        this.drawPlayerName();
    }

    drawStar(data) {
        this.graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        this.graphics.beginFill(0xFFFFFF, 1);
        this.graphics.drawCircle(this.data.location.x, this.data.location.y, 2);
        this.graphics.endFill();
    }

    drawHalo() {
        this.graphics.lineStyle(1, 0xFFFFFF, 0.1);
        this.graphics.drawCircle(this.data.location.x, this.data.location.y, (this.data.naturalResources + 20) / 2);
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
        text.y = this.data.location.y + 15;
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
        // TODO 
    }
}

export default Star;
