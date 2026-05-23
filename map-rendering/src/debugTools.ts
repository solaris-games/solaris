import { BitmapText, Application } from 'pixi.js';
import type Map from './map';

export class DebugTools {
  app: Application;
  map: Map;
  frames: number;
  dtAccum: number;
  lowest: number;
  previousDTs: number[];
  ma32accum: number;
  fpsNowText: BitmapText | undefined;
  fpsMAText: BitmapText | undefined;
  fpsMA32Text: BitmapText | undefined;
  jitterText: BitmapText | undefined;
  lowestText: BitmapText | undefined;
  zoomText: BitmapText | undefined;


  constructor(app: Application, map: Map) {
    this.app = app;
    this.map = map;
    this.frames = 0
    this.dtAccum = 33.0 * 16
    this.lowest = 1000
    this.previousDTs = [33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0, 33.0]
    this.ma32accum = 0;


    this.calcFPS = this.calcFPS.bind(this);
    this.app.ticker.add(this.calcFPS);
  }

  draw() {
    const bitmapFont = { fontFamily: "chakrapetch", fontSize: 16 }
    const left = 64
    const top = 32

    this.fpsNowText = new BitmapText({ text: "", style: bitmapFont })
    this.fpsNowText.zIndex = 1000
    this.fpsMAText = new BitmapText({ text: "", style: bitmapFont })
    this.fpsMAText.zIndex = 1000
    this.fpsMA32Text = new BitmapText({ text: "", style: bitmapFont })
    this.fpsMA32Text.zIndex = 1000
    this.jitterText = new BitmapText({ text: "", style: bitmapFont })
    this.jitterText.zIndex = 1000
    this.lowestText = new BitmapText({ text: "", style: bitmapFont })
    this.lowestText.zIndex = 1000
    this.zoomText = new BitmapText({ text: "", style: bitmapFont })
    this.zoomText.zIndex = 1000
    this.fpsNowText.x = left
    this.fpsNowText.y = 128 + 16
    this.fpsMAText.x = left
    this.fpsMAText.y = this.fpsNowText.y + top + 2
    this.fpsMA32Text.x = left
    this.fpsMA32Text.y = this.fpsMAText.y + top + 2
    this.jitterText.x = left
    this.jitterText.y = this.fpsMA32Text.y + top + 2
    this.lowestText.x = left
    this.lowestText.y = this.jitterText.y + top + 2
    this.zoomText.x = left
    this.zoomText.y = this.lowestText.y + top + 2
    this.app.stage.addChild(this.fpsNowText)
    this.app.stage.addChild(this.jitterText)
    this.app.stage.addChild(this.lowestText)
    this.app.stage.addChild(this.fpsMAText)
    this.app.stage.addChild(this.fpsMA32Text)
    this.app.stage.addChild(this.zoomText)
  }

  destroy() {
    this.app.stage.removeChild(this.fpsNowText!);
    this.app.stage.removeChild(this.jitterText!);
    this.app.stage.removeChild(this.lowestText!);
    this.app.stage.removeChild(this.fpsMAText!);
    this.app.stage.removeChild(this.fpsMA32Text!);
    this.app.stage.removeChild(this.zoomText!);

    this.app.ticker.remove(this.calcFPS);
  }

  calcFPS() {
    const elapsed = this.app!.ticker.elapsedMS
    this.frames += 1
    this.previousDTs.pop()
    this.previousDTs.unshift(elapsed)

    this.dtAccum = this.previousDTs.reduce((total, current) => { return total + current })
    this.ma32accum += elapsed

    let movingAverageDT = this.dtAccum / 16.0
    let movingAverageFPS = 1000.0 / movingAverageDT
    let ma32DT = this.ma32accum / 32.0

    let fps = 1000.0 / elapsed
    if (fps < this.lowest) { this.lowest = fps }
    if (this.fpsNowText) {
      this.fpsNowText.text = ('fps: ' + fps.toFixed(0))
    }

    if (this.frames == 31) {
      let ma32FPS = 1000.0 / ma32DT

      if (this.fpsMAText) {
        this.fpsMAText.text = ('fpsMA: ' + movingAverageFPS.toFixed(0))
      }

      if (this.fpsMA32Text) {
        this.fpsMA32Text.text = ('fpsMA32: ' + ma32FPS.toFixed(0))
      }

      if (this.jitterText) {
        this.jitterText.text = ('jitter: ' + (movingAverageFPS - this.lowest).toFixed(0))
      }

      if (this.lowestText) {
        this.lowestText.text = ('lowest: ' + this.lowest.toFixed(0))
      }

      if (this.zoomText) {
        this.zoomText.text = ('zoom%: ' + this.map!.zoomPercent.toFixed(0))
      }

      this.frames = 0
      this.lowest = 1000
      this.ma32accum = 0
    }
  }
}
