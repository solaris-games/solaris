import {
  CarrierTravelService,
  CombatGroupService,
  CombatService,
  DistanceService,
  type Game,
  GameTypeService,
  PathfindingService,
  PlayerIncomeService,
  ResearchProgressService,
  type Specialist,
  SpecialistValueService,
  PlayerStatisticsService,
  type Star,
  StarDataService,
  StarDistanceService,
  TechnologyService,
  WaypointService,
  type Carrier,
  ShipService,
} from "@solaris/common";

export type ServiceProvider = {
  distanceService: DistanceService;
  starDistanceService: StarDistanceService;
  waypointService: WaypointService<string>;
  gameTypeService: GameTypeService;
  technologyService: TechnologyService;
  starDataService: StarDataService;
  carrierTravelService: CarrierTravelService<string>;
  pathfindingService: PathfindingService<string>;
  combatService: CombatService<string>;
  researchProgressService: ResearchProgressService;
  playerIncomeService: PlayerIncomeService<string>;
  playerStatisticsService: PlayerStatisticsService<string>;
  shipService: ShipService<string>;
};

interface IStarService {
  getById(game: Game<string>, id: string): Star<string>;
  listStarsOwnedByPlayer(
    stars: Star<string>[],
    playerId: string,
  ): Star<string>[];
}

interface ISpecialistService {
  getByIdStar(id: number): Specialist | null;
  getByIdCarrier(id: number): Specialist | null;
}

interface IDiplomacyService {
  isFormalAlliancesEnabled(game: Game<string>): boolean;
  isDiplomaticStatusToPlayersAllied(
    game: Game<string>,
    playerId: string,
    otherPlayerIds: string[],
  ): boolean;
}

interface ICarrierService<ID> {
  listCarriersOwnedByPlayer(
    carriers: Carrier<ID>[],
    playerId: ID,
  ): Carrier<ID>[];
}

export const initialize = (
  starService: IStarService,
  specialistService: ISpecialistService,
  diplomacyService: IDiplomacyService,
  carrierService: ICarrierService<string>,
): ServiceProvider => {
  const gameTypeService = new GameTypeService();
  const distanceService = new DistanceService();
  const starDistanceService = new StarDistanceService(distanceService);
  const technologyService = new TechnologyService(
    specialistService,
    gameTypeService,
  );
  const starDataService = new StarDataService(gameTypeService);
  const researchProgressService = new ResearchProgressService();
  const specialistValueService = new SpecialistValueService(specialistService);
  const carrierTravelService = new CarrierTravelService(
    specialistService,
    technologyService,
    distanceService,
    starDistanceService,
    diplomacyService,
    starDataService,
  );

  const waypointService = new WaypointService(
    starService,
    distanceService,
    starDistanceService,
    technologyService,
    carrierTravelService,
    starDataService,
  );

  const pathfindingService = new PathfindingService(
    distanceService,
    waypointService,
    starDataService,
    technologyService,
  );

  const combatService = new CombatService(
    new CombatGroupService(diplomacyService),
    technologyService,
    specialistService,
  );

  const shipService = new ShipService(
    starService,
    technologyService,
    carrierService,
  );

  const playerStatisticsService = new PlayerStatisticsService(
    starService,
    carrierService,
    specialistValueService,
    shipService,
  );

  const playerIncomeService = new PlayerIncomeService(
    starService,
    technologyService,
    playerStatisticsService,
    starDataService,
    specialistValueService,
  );

  return {
    starDataService,
    carrierTravelService,
    distanceService,
    starDistanceService,
    waypointService,
    gameTypeService,
    technologyService,
    pathfindingService,
    combatService,
    researchProgressService,
    playerIncomeService,
    playerStatisticsService,
    shipService,
  };
};
