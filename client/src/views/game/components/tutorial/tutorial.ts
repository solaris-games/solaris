import type {Game, Player, Star} from "@/types/game";

export type TutorialProps = {
  page: number,
  game: Game,
  player: Player,
  setTutorial: (title: string, maxPages: number) => void,
  setTutorialCompleted: () => void,
  onOpenStarDetailRequested: (starId: string) => void,
  isTutorialCompleted: boolean,
  startingStars: number,
  playerHomeStar: Star,
  playerStars: Star[],
  starsForVictory: number,
}
