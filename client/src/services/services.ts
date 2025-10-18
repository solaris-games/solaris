import {
  CarrierTravelService,
  DistanceService,
  type Game, GameTypeService, type Specialist,
  type Star, StarDataService,
  StarDistanceService,
  TechnologyService,
  WaypointService
} from "@solaris-common";

export type ServiceProvider = {
  distanceService: DistanceService;
  starDistanceService: StarDistanceService;
  waypointService: WaypointService<string>;
  gameTypeService: GameTypeService;
  technologyService: TechnologyService;
  starDataService: StarDataService;
  carrierTravelService: CarrierTravelService<string>;
}

interface IStarService {
  getById(game: Game<string>, id: string): Star<string>;
}

interface ISpecialistService {
  getByIdStar(id: number): Specialist | null;
  getByIdCarrier(id: number): Specialist | null;
}

interface IDiplomacyService {
  isFormalAlliancesEnabled(game: Game<string>): boolean;
  isDiplomaticStatusToPlayersAllied(game: Game<string>, playerId: string, otherPlayerIds: string[]): boolean;
}

export const initialize = (starService: IStarService, specialistService: ISpecialistService, diplomacyService: IDiplomacyService): ServiceProvider => {
  const gameTypeService = new GameTypeService();
  const distanceService = new DistanceService();
  const starDistanceService = new StarDistanceService(distanceService);
  const technologyService = new TechnologyService(specialistService, gameTypeService);
  const starDataService = new StarDataService();
  const carrierTravelService = new CarrierTravelService(specialistService, technologyService, distanceService, starDistanceService, diplomacyService, starDataService);

  const waypointService = new WaypointService(starService, distanceService, starDistanceService, technologyService, carrierTravelService, starDataService);

  return {
    starDataService,
    carrierTravelService,
    distanceService,
    starDistanceService,
    waypointService,
    gameTypeService,
    technologyService,
  }
}
