import * as PIXI from 'pixi.js';

class Star {
    constructor(data) {
        this.data = data;
    }

    draw(container, graphics) {
        this.drawStar(container, graphics);
        this.drawHalo(container, graphics);
        this.drawName(container, graphics);
        this.drawGarrison(container, graphics);
        this.drawInfrastructure(container, graphics);
        this.drawPlayerName(container, graphics);
    }

    drawStar(container, graphics) {
        graphics.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawCircle(this.data.location.x, this.data.location.y, 2);
        graphics.endFill();
    }

    drawHalo(container, graphics) {
        graphics.lineStyle(1, 0xFFFFFF, 0.1);
        graphics.drawCircle(this.data.location.x, this.data.location.y, (this.data.naturalResources + 20) / 2);
    }

    drawName(container, graphics) {
        let text = new PIXI.Text(this.data.name, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 6;
        text.resolution = 10;

        container.addChild(text);
    }

    drawGarrison(container, graphics) {
        if (!this.data.garrison) return;

        let text = new PIXI.Text(this.data.garrison, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 15;
        text.resolution = 10;

        container.addChild(text);
    }

    drawInfrastructure(container, graphics) {
        if (!this.data.ownedByPlayerId) return; // TODO Does abandoning stars destroy ALL infrastructure?
        
        let text = new PIXI.Text(`${this.data.economy} ${this.data.industry} ${this.data.science}`, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y - 18;
        text.resolution = 10;

        container.addChild(text);
    }

    drawPlayerName(container, graphics) {
        // TODO 
    }
}

export default Star;