import { DiplomaticStatus } from "solaris-common";
import { BaseGameEvent } from "./BaseGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface GameDiplomacyWarDeclaredEvent extends BaseGameEvent {
    status: DiplomaticStatus<DBObjectId>;
};
