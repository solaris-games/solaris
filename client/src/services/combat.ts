import type {BaseCombatEvent, CombatCarrier, CombatStar, PlayerCombatStarEvent, Specialist} from "@solaris/common"
import type { Player, Carrier, Star, Game } from "../types/game"
import gameHelper from "./gameHelper"

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

const createSide = (participantsGroups: Map<string, CombatActor[]>, game: Game, weaponsLevel: number): CombatSide => {
  const participants = Array.from(participantsGroups, ([playerId, actors]) => {
    actors.sort((a, b) => {
      if (a.object.kind === 'star') {
        return -1;
      } else if (b.object.kind === 'star') {
        return 1;
      }

      return compareResult(a.before, b.before);
    });

    return { player: gameHelper.getPlayerById(game, playerId)!, group: actors };
  });

  participants.sort((a, b) => {
    const sumA = a.group.reduce((acc, actor) => acc + resultToNumber(actor.before), 0);
    const sumB = b.group.reduce((acc, actor) => acc + resultToNumber(actor.before), 0);

    return sumB - sumA;
  });

  return {
    participants,
    weaponsLevel,
  }
}

export const resultToNumber = (result: CombatParticipantResult) => {
  return typeof result === 'number' ? result : 0;
}

const createCarrierSide = (game: Game, event: BaseCombatEvent<string>, sidePlayers: Player[], weaponsLevel: number) => {
  const relevantCarriers = event.data.combatResult.carriers.filter(c => sidePlayers.find(d => d._id === c.ownedByPlayerId));

  const participantsGroups = new Map<string, CombatActor[]>();

  for (const car of relevantCarriers) {
    const group = participantsGroups.get(car.ownedByPlayerId) || [];
    group.push(carrierToCombatActor(car));
    participantsGroups.set(car.ownedByPlayerId, group);
  }

  return createSide(participantsGroups, game, weaponsLevel);
}

export const createCarrierDefenderSide = (game: Game, event: BaseCombatEvent<string>) => {
  const defenders = event.data.playerIdDefenders.map(id => gameHelper.getPlayerById(game, id)!);

  return createCarrierSide(game, event, defenders, event.data.combatResult.weapons.defender);
}

export const createCarrierAttackerSide = (game: Game, event: BaseCombatEvent<string>) => {
  const attackers = event.data.playerIdAttackers.map(id => gameHelper.getPlayerById(game, id)!);

  return createCarrierSide(game, event, attackers, event.data.combatResult.weapons.attacker);
}
