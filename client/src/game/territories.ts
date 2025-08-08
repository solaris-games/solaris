import { Container } from 'pixi.js'
import type {Game} from '../types/game';
import type { DrawingContext } from './container';
import type {UserGameSettings} from "@solaris-common";
import {drawTerritoriesMarchingSquare} from "@/game/territories/marchingSquares";
import {drawTerritoriesVoronoi} from "@/game/territories/voronoi";

export class Territories {
  container: Container;
  game: Game;
  zoomPercent: number;
  context: DrawingContext;
  userSettings: UserGameSettings;

  constructor(context: DrawingContext, game: Game, userSettings: UserGameSettings) {
    this.container = new Container();
    this.game = game;
    this.context = context;
    this.zoomPercent = 0;
    this.userSettings = userSettings;
  }

  update(game: Game, userSettings: UserGameSettings) {
    this.game = game;
    this.userSettings = userSettings;
  }

  draw() {
    this.container.removeChildren()

    if (!this.game.galaxy.stars?.length) {
      return;
    }

    switch (this.userSettings.map.territoryStyle) {
      case 'marching-square':
        drawTerritoriesMarchingSquare(this.game, this.userSettings, this.context, this.container);
        break;
      case 'voronoi':
        drawTerritoriesVoronoi(this.game, this.userSettings, this.context, this.container);
        break;
    }

    this.refreshZoom(this.zoomPercent || 0)
  }

  refreshZoom(zoomPercent: number) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent <= this.userSettings.map.zoomLevels.territories;
    }
  }
}

export default Territories
