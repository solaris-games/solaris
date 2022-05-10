import { DiplomaticStatus } from "../Diplomacy";
import { BaseGameEvent } from "./baseGameEvent";

export default interface GameDiplomacyPeaceDeclaredEvent extends BaseGameEvent {
    status: DiplomaticStatus;
};
