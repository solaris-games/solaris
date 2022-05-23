import { DiplomaticStatus } from "../Diplomacy";
import { BaseGameEvent } from "./BaseGameEvent";

export default interface GameDiplomacyPeaceDeclaredEvent extends BaseGameEvent {
    status: DiplomaticStatus;
};
