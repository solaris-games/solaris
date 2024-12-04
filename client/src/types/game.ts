import type { Game as CGame } from "@solaris-common";
import type { Player as CPlayer } from "@solaris-common";
import type { Star as CStar } from "@solaris-common";
import type { Carrier as CCarrier } from "@solaris-common";

export type Game = CGame<string>;

export type Player = CPlayer<string>;

export type Star = CStar<string>;

export type Carrier = CCarrier<string>;
