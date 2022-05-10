import { DiplomaticStatus } from "../Diplomacy";
import { BaseGameEvent } from "./baseGameEvent";

export default interface GameDiplomacyWarDeclaredEvent extends BaseGameEvent {
    status: DiplomaticStatus;
};
