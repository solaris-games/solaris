import { Carrier } from "./Carrier";

export interface CarrierCollision {
    time: number,
    location: number,
    carriers: Carrier[]
}

export interface DualCarrierCollision {
    time: number;
    location: number;
    carriers: [Carrier, Carrier];
}