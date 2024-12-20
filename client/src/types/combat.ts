import type { CombatCarrier, CombatStar, PlayerCombatStarEvent, Specialist } from "@solaris-common"
import type { Player, Carrier, Star, Game } from "./game"
import gameHelper from "../services/gameHelper"

export type CombatParticipantResult = number | '???';

export type CombatActorObject =
  | { kind: 'star', star: CombatStar<string>, starName: string }
  | { kind: 'carrier', carrier: CombatCarrier<string> }

export type CombatActor = {
  specialist: Specialist | null,
  object: CombatActorObject,
  before: CombatParticipantResult,
  lost: CombatParticipantResult,
  after: CombatParticipantResult,
}

export type CombatParticipant = {
  player: Player,
  group: CombatActor[],
}

export type CombatSide = {
  participants: CombatParticipant[],
  weaponsLevel: number,
  baseWeaponsLevel: number,
}

const starToCombatActor = (event: PlayerCombatStarEvent<string>, star: CombatStar<string>): CombatActor => {
  return {
    specialist: star.specialist,
    object: { kind: 'star', star, starName: event.data.starName },
    before: star.before,
    after: star.after,
    lost: star.lost,
  }
}

const carrierToCombatActor = (carrier: CombatCarrier<string>): CombatActor => {
  return {
    specialist: carrier.specialist,
    object: { kind: 'carrier', carrier },
    before: typeof carrier.before === 'number' ? carrier.before : '???',
    lost: typeof carrier.lost === 'number' ? carrier.lost : '???',
    after: typeof carrier.after === 'number' ? carrier.after : '???',
  }
}

export const compareResult = (a: CombatParticipantResult, b: CombatParticipantResult) => {
  if (a === '???' || b === '???') {
    return 0;
  }

  return a - b;
}

export const createStarDefenderSide = (game: Game, event: PlayerCombatStarEvent<string>): CombatSide => {
  const defenders = event.data.playerIdDefenders.map(id => gameHelper.getPlayerById(game, id)!);

  const defenderCarriers = event.data.combatResult.carriers.filter(c => defenders.find(d => d._id === c.ownedByPlayerId));

  const weaponsLevel = event.data.combatResult.weapons.defender;
  const baseWeaponsLevel = event.data.combatResult.weapons.defenderBase;

  const participantsGroups = new Map<string, CombatActor[]>();

  const star = event.data.combatResult.star!;
  participantsGroups.set(star.ownedByPlayerId!, [starToCombatActor(event, star)])

  for (const car of defenderCarriers) {
    const group = participantsGroups.get(car.ownedByPlayerId) || [];
    group.push(carrierToCombatActor(car));
    participantsGroups.set(car.ownedByPlayerId, group);
  }

  const participants = Array.from(participantsGroups, ([playerId, actors]) => ({ player: gameHelper.getPlayerById(game, playerId)!, group: actors }));

  return {
    participants,
    weaponsLevel,
    baseWeaponsLevel,
  }
};

export const createStarAttackerSide = (game: Game, event: PlayerCombatStarEvent<string>) => {
  const attackers = event.data.playerIdAttackers.map(id => gameHelper.getPlayerById(game, id)!);

  const attackerCarriers = event.data.combatResult.carriers.filter(c => attackers.find(d => d._id === c.ownedByPlayerId));

  const weaponsLevel = event.data.combatResult.weapons.attacker;
  const baseWeaponsLevel = event.data.combatResult.weapons.attackerBase;

  const participantsGroups = new Map<string, CombatActor[]>();

  for (const car of attackerCarriers) {
    const group = participantsGroups.get(car.ownedByPlayerId) || [];
    group.push(carrierToCombatActor(car));
    participantsGroups.set(car.ownedByPlayerId, group);
  }

  const participants = Array.from(participantsGroups, ([playerId, actors]) => ({ player: gameHelper.getPlayerById(game, playerId)!, group: actors }));

  return {
    participants,
    weaponsLevel,
    baseWeaponsLevel,
  }
};
