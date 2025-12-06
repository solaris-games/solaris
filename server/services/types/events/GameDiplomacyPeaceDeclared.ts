import { DiplomaticStatus } from "solaris-common";
import { BaseGameEvent } from "./BaseGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface GameDiplomacyPeaceDeclaredEvent extends BaseGameEvent {
    status: DiplomaticStatus<DBObjectId>;
};
