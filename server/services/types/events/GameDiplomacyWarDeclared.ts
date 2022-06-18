import { DiplomaticStatus } from "../Diplomacy";
import { BaseGameEvent } from "./BaseGameEvent";

export default interface GameDiplomacyWarDeclaredEvent extends BaseGameEvent {
    status: DiplomaticStatus;
};
