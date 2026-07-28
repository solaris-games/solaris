import type { ResearchType } from "@solaris/common";

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
