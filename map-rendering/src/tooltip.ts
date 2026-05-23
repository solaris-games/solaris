import * as PIXI from 'pixi.js'
import type {Carrier, Game, Star} from './types/game';
import type {DrawingContext, TooltipData, TooltipService} from './container';

const PADDING_X = 2;
const PADDING_Y = 2;

export default class {
  container: PIXI.Container;
  game: Game;
  context: DrawingContext;
  intervalDraw: number | null = null;
  tooltipService: TooltipService;

  constructor(game: Game, context: DrawingContext, tooltipService: TooltipService) {
    this.tooltipService = tooltipService;
    this.game = game;
    this.context = context;
    this.container = new PIXI.Container();
    this.container.eventMode = 'passive';
  }

  update(game: Game, context: DrawingContext) {
    this.game = game;
    this.context = context;
  }

  clear() {
    if (this.intervalDraw) {
      clearInterval(this.intervalDraw);
      this.intervalDraw = null;
    }

    this.container.removeChildren();
  }

  _drawTooltip(tooltipData: TooltipData) {
    this.container.removeChildren();

    if (!this.game) {
      return;
    }

    const internalContainer = new PIXI.Container();
    internalContainer.x = PADDING_X;
    internalContainer.y = PADDING_Y;

    const textStyle = new PIXI.TextStyle({
      fontFamily: `Chakra Petch,sans-serif;`,
      fill: 0xFFFFFF,
      fontSize: 6,
      fontWeight: 'bold'
    });

    for (let i = 0; i < tooltipData.detail.length; i++) {
      const text = new PIXI.Text(tooltipData.detail[i], textStyle);
      text.resolution = 12;

      const prev = internalContainer.children[i - 1] as PIXI.Text;

      if (prev) {
        text.y = prev.y + prev.height
      } else {
        text.y = 0
      }

      internalContainer.addChild(text)
    }

    const graphics = new PIXI.Graphics()
    graphics.roundRect(0, 0, internalContainer.width + (PADDING_X * 2), internalContainer.height + (PADDING_Y * 2), 1)

    graphics.fill({
      color: 0x000000,
    });

    graphics.stroke({
      width: 1,
      color: this.context!.getPlayerColour(tooltipData.player._id),
    });

    this.container.addChild(graphics)
    this.container.addChild(internalContainer)

    if (tooltipData.offset.relative) {
      this.container.x = tooltipData.location.x + tooltipData.offset.x
      this.container.y = tooltipData.location.y - (this.container.height / 2) + tooltipData.offset.y
    } else {
      this.container.x = tooltipData.location.x + tooltipData.offset.x
      this.container.y = tooltipData.location.y + tooltipData.offset.y
    }
  }

  drawTooltipCarrier(carrier: Carrier) {
    this.clear();

    // Note: We have to do this in order to account
    // for carrier ETAs in real time.
    const redraw = () => {
      if (!this.game) {
        return;
      }

      const tooltipData = this.tooltipService.getCarrier(this.game, carrier);
      if (tooltipData) {
        this._drawTooltip(tooltipData);
      }
    };

    this.intervalDraw = setInterval(redraw, 250) as unknown as number;
    redraw();
  }

  drawTooltipStar(star: Star) {
    this.clear();


  }
}
