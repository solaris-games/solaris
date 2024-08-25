import { Carrier } from "./Carrier";

export interface CarrierCollision {
    time: number,
    location: number,
    carriers: Carrier[]
}