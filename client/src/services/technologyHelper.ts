import type { ResearchType, ResearchTypeNotRandom } from "@solaris/common";
import type { Game } from "@/types/game";

class TechnologyHelper {
  FRIENDLY_NAMES = {
    scanning: "Scanning",
    hyperspace: "Hyperspace Range",
    terraforming: "Terraforming",
    experimentation: "Experimentation",
    weapons: "Weapons",
    banking: "Banking",
    manufacturing: "Manufacturing",
    specialists: "Specialists",
  };

  getFriendlyName(technologyKey: ResearchType) {
    return this.FRIENDLY_NAMES[technologyKey];
  }

  getResearchableOptions(
    game: Game,
    technologyService: {
      isTechnologyEnabled: (game: Game, key: ResearchTypeNotRandom) => boolean;
      isTechnologyResearchable: (
        game: Game,
        key: ResearchTypeNotRandom,
      ) => boolean;
    },
  ): { text: string; value: ResearchTypeNotRandom }[] {
    return (Object.keys(this.FRIENDLY_NAMES) as ResearchTypeNotRandom[])
      .filter(
        (key) =>
          technologyService.isTechnologyEnabled(game, key) &&
          technologyService.isTechnologyResearchable(game, key),
      )
      .map((key) => ({ text: this.FRIENDLY_NAMES[key], value: key }));
  }

  getIcon(technologyKey: ResearchType) {
    switch (technologyKey) {
      case "scanning":
        return "binoculars";
      case "hyperspace":
        return "gas-pump";
      case "terraforming":
        return "globe-europe";
      case "experimentation":
        return "microscope";
      case "weapons":
        return "gun";
      case "banking":
        return "money-bill-alt";
      case "manufacturing":
        return "industry";
      case "specialists":
        return "user-astronaut";
    }

    return "question";
  }
}

export default new TechnologyHelper();
