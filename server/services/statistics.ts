import Repository from "./repository";
import {StatsSlice} from "solaris-common";
import {DBObjectId} from "./types/DBObjectId";

export default class StatisticsService {
    statsSliceRepository: Repository<StatsSlice<DBObjectId>>;

    constructor(statsSliceRepository: Repository<StatsSlice<DBObjectId>>) {
        this.statsSliceRepository = statsSliceRepository;
    }
}