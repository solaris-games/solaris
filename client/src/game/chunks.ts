import { Container, Graphics } from 'pixi.js';
import type { Game } from '../types/game';
import gameHelper from '../services/gameHelper'
import type Star from './star';
import type Carrier from './carrier';
import type { MapObject } from './mapObject';

const CHUNK_SIZE = 256

class Chunk extends Container {
  mapObjects: MapObject[] = [];
  visualizer: Graphics | undefined = undefined;

  constructor() {
    super();

    this.sortableChildren = true;
  }
}

export class Chunks {
  chunks: Chunk[][] = [];
  numof_chunkX: number = 0;
  numof_chunkY: number = 0;
  firstChunkX: number = 0;
  firstChunkY: number = 0;
  lastChunkX: number = 0;
  lastChunkY: number = 0;
  minMouseChunkX: number = 0;
  maxMouseChunkX: number = 0;
  minMouseChunkY: number = 0;
  maxMouseChunkY: number = 0;
  chunksContainer: Container;

  constructor(game: Game, stars: Star[], carriers: Carrier[]) {
    this.chunksContainer = new Container()
    this.chunksContainer.zIndex = 7;

    this.update(game, stars, carriers);
  }

  update(game: Game, stars: Star[], carriers: Carrier[]) {
    this.chunksContainer.removeChildren();

    const carrierMinX = gameHelper.calculateMinCarrierX(game)
    const carrierMinY = gameHelper.calculateMinCarrierY(game)
    const carrierMaxX = gameHelper.calculateMaxCarrierX(game)
    const carrierMaxY = gameHelper.calculateMaxCarrierY(game)

    const starMinX = gameHelper.calculateMinStarX(game)
    const starMinY = gameHelper.calculateMinStarY(game)
    const starMaxX = gameHelper.calculateMaxStarX(game)
    const starMaxY = gameHelper.calculateMaxStarY(game)

    const minX = Math.min(carrierMinX, starMinX)
    const minY = Math.min(carrierMinY, starMinY)
    const maxX = Math.max(carrierMaxX, starMaxX)
    const maxY = Math.max(carrierMaxY, starMaxY)

    this.firstChunkX = Math.floor(minX / CHUNK_SIZE)
    this.firstChunkY = Math.floor(minY / CHUNK_SIZE)

    this.lastChunkX = Math.floor(maxX / CHUNK_SIZE)
    this.lastChunkY = Math.floor(maxY / CHUNK_SIZE)

    this.numof_chunkX = this.lastChunkX - this.firstChunkX + 1
    this.numof_chunkY = this.lastChunkY - this.firstChunkY + 1

    let chunkColumns = Array(this.numof_chunkX)
    for (let i = 0; i < this.numof_chunkX; i++) { chunkColumns[i] = Array(this.numof_chunkY) }

    this.chunks = chunkColumns

    for (let ix = 0; ix < this.numof_chunkX; ix++) {
      for (let iy = 0; iy < this.numof_chunkY; iy++) {
        this.chunks[ix][iy] = new Chunk();
        this.chunksContainer!.addChild(this.chunks[ix][iy])
      }
    }

    stars.forEach(s => this.addContainerToChunk(s, this.firstChunkX, this.firstChunkY))
    carriers.forEach(c => this.addContainerToChunk(c, this.firstChunkX, this.firstChunkY))
  }

  onTick (positionChanging: boolean, zoomChanging: boolean, zoomPercent: number, viewport: { left: number, right: number, bottom: number, top: number }) {
    const firstX = Math.floor(viewport.left/CHUNK_SIZE)
    const firstY = Math.floor(viewport.top/CHUNK_SIZE)

    const lastX = Math.floor(viewport.right/CHUNK_SIZE)
    const lastY = Math.floor(viewport.bottom/CHUNK_SIZE)

    if (!positionChanging && !zoomChanging) {
      return;
    }

    for(let ix=0; ix<this.numof_chunkX; ix++) {
      for(let iy=0; iy<this.numof_chunkY; iy++) {
        if(
        (ix>=(firstX-this.firstChunkX))&&(ix<=(lastX-this.firstChunkX)) &&
        (iy>=(firstY-this.firstChunkY))&&(iy<=(lastY-this.firstChunkY))
        )
        {
          if( !this.chunks[ix][iy].visible ) {
            this.chunks[ix][iy].visible = true
            this.chunks[ix][iy].interactiveChildren = true
            //this.chunks[ix][iy].visualizer.visible = true
            for( let mapObject of this.chunks[ix][iy].mapObjects ) {
              mapObject.onZoomChanging(zoomPercent)
            }
          }
          else {
            if( zoomChanging ) {
              for( let mapObject of this.chunks[ix][iy].mapObjects ) {
                mapObject.onZoomChanging(zoomPercent)
              }
            }
          }
        }
        else {
          this.chunks[ix][iy].visible = false
          this.chunks[ix][iy].interactiveChildren = false
          //this.chunks[ix][iy].visualizer.visible = false
        }
      }
    }
  }

  addContainerToChunk(mapObject: MapObject, firstX: number, firstY: number) { // Star or carrier
    const chunkX = Math.floor(mapObject.getLocation().x / CHUNK_SIZE)
    const chunkY = Math.floor(mapObject.getLocation().y / CHUNK_SIZE)
    const ix = chunkX - firstX
    const iy = chunkY - firstY

    this.chunks[ix][iy].addChild(mapObject.getContainer())
    this.chunks[ix][iy].mapObjects.push(mapObject)
  }

  removeContainerFromChunk(mapObject: MapObject, chunks: Chunk[][], firstX: number, firstY: number) {
    const chunkX = Math.floor(mapObject.getLocation().x / CHUNK_SIZE)
    const chunkY = Math.floor(mapObject.getLocation().y / CHUNK_SIZE)
    const ix = chunkX - firstX
    const iy = chunkY - firstY

    chunks[ix][iy].removeChild(mapObject.getContainer())
    const index = chunks[ix][iy].mapObjects.indexOf(mapObject)
    if (index > -1) { chunks[ix][iy].mapObjects.splice(index, 1) }
  }

  removeMapObjectFromChunks(mapObject: MapObject) {
    for (let chunkX of this.chunks) {
      for (let chunkY of chunkX) {
        if (chunkY.mapObjects.indexOf(mapObject) > -1) {
          chunkY.mapObjects.splice(chunkY.mapObjects.indexOf(mapObject), 1)
          chunkY.removeChild(mapObject.getContainer())
        }
      }
    }
  }
}
