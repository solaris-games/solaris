import * as PIXI from 'pixi.js-legacy'
import gameHelper from '../services/gameHelper'

class PlayerNames {

  static zoomLevel = 90

  constructor () {
    this.container = new PIXI.Container()

    this.zoomPercent = 0
  }

  setup (game, userSettings) {
    this.game = game

    PlayerNames.zoomLevel = userSettings.map.zoomLevels.playerNames
  }

  draw () {
    this.container.removeChildren()

    let style = new PIXI.TextStyle({
      fontFamily: `Chakra Petch,sans-serif;`,
      fill: 0xFFFFFF,
      padding: 3,
      fontSize: 50
    });

    let test_text = new PIXI.Text('Test For Height', style);
    let text_height = test_text.height + 40;
    let top_text = Number.NEGATIVE_INFINITY;
    let low_text = Number.POSITIVE_INFINITY;

    let names = [];
    for (let player of this.game.galaxy.players) {
      let empireCenter = gameHelper.getPlayerEmpireCenter(this.game, player)

      if (empireCenter == null) {
        continue;
      }

      top_text = empireCenter.y > top_text ? empireCenter.y : top_text
      low_text = empireCenter.y < low_text ? empireCenter.y : low_text

      let text_name = new PIXI.Text(player.alias, style)

      player.empireCenter = empireCenter;
      names.push({
        text_name,
        player
      });
    }

    // Here we create a horizontal grid so we can give each name a place on this grid. That way we prevent all forms of vertical clashing
    let barCount = Math.ceil((top_text - low_text) / (text_height * 1.2));
    let bars = new Array(barCount).fill([]);

    // Now we place each name in the grid
    for (let name of names) {
      let index = Math.round((top_text - name.player.empireCenter.y) / (text_height * 1.2));
      name.player.empireCenter.y = top_text - index * (text_height * 1.2)
      bars[index].push(name);
    }

    // TODO: This loop is somehow broken. The act of looping through the different bars (arrays) seems to merge them. Which I cannot explain
    let toDraw = []
    for (let bar of bars) {
      if(bar.length > 1) {
        bar.sort((a, b) => a.player.empireCenter.x - b.player.empireCenter.x);
        if(this.hasBarOverlap(bar)) {
          this.spaceOut(bar);
        }
      }
      toDraw.push(bar)
    }

    for (let entry of names) {
      let text_name = new PIXI.Text(entry.player.alias, style)
      text_name.x = entry.player.empireCenter.x - entry.text_name.width/2
      text_name.y = entry.player.empireCenter.y - entry.text_name.height/2
      text_name.resolution = 2
      text_name.zIndex = 10

      let graphics = new PIXI.Graphics()
      graphics.beginFill(entry.player.colour.value)
      graphics.drawRoundedRect(text_name.x - 10, text_name.y - 10, text_name.width + 20, text_name.height + 20, 10)
      graphics.endFill()
      graphics.alpha = 0.7

      this.container.addChild(graphics)
      this.container.addChild(text_name)
    }

    this.refreshZoom(this.zoomPercent || 0)
  }

  hasBarOverlap(bar) {
    for (let i = 0; i < bar.length - 1; i++) {
      if(this.hasOverlap(bar[i], bar[i+1])) {
        return true;
      }
    }
    return false;
  }

  hasOverlap(entryA, entryB) {
    return (entryA.player.empireCenter.x + (entryA.text_name.height + 40) / 2) > ((entryB.player.empireCenter.x - (entryB.text_name.height + 40) / 2));
  }

  spaceOut(bar) {
    let entries = bar.length
    let c = Math.floor(entries/2)
    for (let i = c - 1; i >= 0; i--) {
      if(this.hasOverlap(bar[i], bar[i+1])) {
        bar[i] = this.moveNameLeft(bar[i], bar[i+1]);
      }
    }
    for (let i = c + 1; i < bar.length; i++) {
      if(this.hasOverlap(bar[i-1], bar[i])) {
        bar[i] = this.moveNameRight(bar[i], bar[i-1]);
      }
    }
    return bar;
  }

  moveNameLeft(entryA, entryB) {
    // Move entryA enough to the left to not have overlap
    entryA.player.empireCenter.x = entryB.player.empireCenter.x - (entryA.text_name.width + 40)/2 - (entryB.text_name.width + 40)/2
    return entryA;
  }

  moveNameRight(entryA, entryB) {
    // Move entryB enough to the right to not have overlap
    entryA.player.empireCenter.x = entryB.player.empireCenter.x + (entryA.text_name.width + 40)/2 + (entryB.text_name.width + 40)/2
    return entryA;
  }

  onTick( zoomPercent, zoomChanging ) {
    this.zoomPercent = zoomPercent

    if( zoomChanging ) {
      if (this.container) {
        this.container.visible = zoomPercent <= PlayerNames.zoomLevel
      }
    }
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent <= PlayerNames.zoomLevel
    }
  }

}

export default PlayerNames
