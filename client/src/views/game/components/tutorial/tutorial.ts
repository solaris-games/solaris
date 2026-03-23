import type {Game} from "@/types/game";

export type TutorialProps = {
  page: number,
  game: Game,
  setTutorial: (title: string, maxPages: number) => void,
  setTutorialCompleted: () => void,
}
