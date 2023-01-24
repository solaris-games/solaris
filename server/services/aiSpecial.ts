import { Game } from "./types/Game";
import { NonPlayer } from "./types/NonPlayer";

export default async function doSpecialLogic(game: Game, player: NonPlayer) {
  switch (player.type) {
    case "Dragon":
      break;
    case "Trader":
      if (player.stars.length === 0) {
        player.stars.push(getRandomStar()._id);
      }
      break;
  }

  function getRandomStar() {
    const stars = game.galaxy.stars.map((v) => v);
    stars.sort(() => (0.5 - Math.random() > 0 ? 1 : -1));
    return stars[0];
  }
}
