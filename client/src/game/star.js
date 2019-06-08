import * as PIXI from 'pixi.js';

class Star {
    constructor(data) {
        this.data = data;
    }

    draw(container, graphics) {
        this.drawStar(container, graphics);
        this.drawHalo(container, graphics);
        this.drawStarName(container, graphics);
        this.drawStarGarrison(container, graphics);
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

    drawStarName(container, graphics) {
        let text = new PIXI.Text(this.data.name, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 10;
        text.resolution = 10;

        container.addChild(text);
    }

    drawStarGarrison(container, graphics) {
        if (!this.data.garrison) return;

        let text = new PIXI.Text(this.data.garrison, {
            fontSize: 8,
            fill: 0xFFFFFF
        });

        text.x = this.data.location.x - (text.width / 2);
        text.y = this.data.location.y + 18;
        text.resolution = 10;

        container.addChild(text);
    }
}

export default Star;