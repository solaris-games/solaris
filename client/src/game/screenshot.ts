import type { Game } from "../types/game";
import { type GameContainer } from "./container";

export const screenshot = (container: GameContainer, game: Game) => {
  const app = container.app!;

  const filename = `${game.settings.general.name}-${new Date().toISOString()}`;

  app.renderer.extract.download({
    filename,
    target: app.stage
  });
}
