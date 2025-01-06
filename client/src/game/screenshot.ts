import type { Game } from "../types/game";
import { type GameContainer } from "./container";

export const screenshot = (container: GameContainer, game: Game) => {
  const app = container.app!;

  const filename = `${game.settings.general.name}-${new Date().toISOString()}`;


  //https://www.pixiplayground.com/#/edit/wffvzGE8E2hwQBWvZGpT4
  app.renderer.extract.download({
    filename,
    target: container.viewport!
  });
}
