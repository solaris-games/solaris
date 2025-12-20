import { DiplomaticStatus } from "solaris-common";
import { InternalGameEvent } from "./InternalGameEvent";
import {DBObjectId} from "../DBObjectId";

export default interface InternalGameDiplomacyPeaceDeclaredEvent extends InternalGameEvent {
    status: DiplomaticStatus<DBObjectId>;
};
