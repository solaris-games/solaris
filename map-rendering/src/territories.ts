import { Container } from 'pixi.js'
import type {Game} from './types/game';
import type { DrawingContext } from './container';
import {DistanceService, type UserGameSettings} from "@solaris/common";

export class Territories {
  container: Container;
  game: Game;
  zoomPercent: number;
  context: DrawingContext;
  userSettings: UserGameSettings;
  distanceService: DistanceService;

  constructor(distanceService: DistanceService, context: DrawingContext, game: Game, userSettings: UserGameSettings) {
    this.container = new Container();
    this.game = game;
    this.context = context;
    this.zoomPercent = 0;
    this.userSettings = userSettings;
    this.distanceService = distanceService;
    this._prefetchImplementation();
  }

  update(game: Game, userSettings: UserGameSettings) {
    this.game = game;
    this.userSettings = userSettings;
    this._prefetchImplementation();
  }

  private _prefetchImplementation() {
    switch (this.userSettings.map.territoryStyle) {
      case 'marching-square':
        import('./territories/marchingSquares');
        break;
      case 'voronoi':
        import('./territories/voronoi');
        break;
    }
  }

  async draw() {
    this.container.removeChildren()

    if (!this.game.galaxy.stars?.length) {
      return;
    }

    switch (this.userSettings.map.territoryStyle) {
      case 'marching-square': {
        const { drawTerritoriesMarchingSquare } = await import('./territories/marchingSquares');
        drawTerritoriesMarchingSquare(this.distanceService, this.game, this.userSettings, this.context, this.container);
        break;
      }
      case 'voronoi': {
        const { drawTerritoriesVoronoi } = await import('./territories/voronoi');
        drawTerritoriesVoronoi(this.game, this.userSettings, this.context, this.container);
        break;
      }
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
