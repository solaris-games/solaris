import type { Game } from "../types/game";
import { type GameContainer } from "./container";

export const screenshot = (container: GameContainer, game: Game, reportGameError: (msg: string) => void) => {
  const app = container.app!;

  const filename = `${game.settings.general.name}-${new Date().toISOString()}`;


  try {
    //https://www.pixiplayground.com/#/edit/wffvzGE8E2hwQBWvZGpT4
    app.renderer.extract.download({
      filename,
      target: container.viewport!
    });
  } catch (e) {
    console.error("Failed to create image from viewport", e);

    reportGameError("Failed to create image");
  }
}
