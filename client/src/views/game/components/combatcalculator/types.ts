import type {Game, Player} from "@/types/game";
import {
  type CombatBaseCarrier,
  type CombatBasePlayer,
  type CombatBaseStar,
  type CombatGroup,
  CombatService
} from "@solaris/common";

export type CCCarrier = {
  ships: number;
  specialistId: number | null;
}

export type CCStar = {
  ships: number;
  specialistId: number | null;
}

export type CCGroupWeaponsSpec =
  | { kind: 'level', level: number }
  | { kind: 'players', players: Player[] }

export type CCGroup = {
  weapons: CCGroupWeaponsSpec,
  name: string;
  star: CCStar | undefined;
  carriers: CCCarrier[];
};

export const makeCombatGroups = (game: Game, gr: CCGroup[], combatService: CombatService<string>) : CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>[] => {
  const combatGroups = gr.map((g, idx) => {
    const totalShips = g.carriers.reduce((acc, c) => acc + c.ships, 0) + (g.star ? g.star.ships : 0);

    let players: CombatBasePlayer<string>[];

    if (g.weapons.kind === 'level') {
      players = [
        {
          _id: `Group_${idx}`,
          research: {
            weapons: {
              level: g.weapons.level,
            }
          }
        }
      ];
    } else {
      players = g.weapons.players;
    }

    const firstPlayer = players[0];

    const mapStar = (star: CCStar): CombatBaseStar<string> => {
      return {
        _id: `Star_${idx}`,
        ships: star.ships,
        specialistId: star.specialistId,
        ownedByPlayerId: firstPlayer._id,
      };
    };

    const mapCarrier = (carrier: CCCarrier, cidx: number): CombatBaseCarrier<string> => {
      return {
        _id: `Carrier_${idx}_${cidx}`,
        ships: carrier.ships,
        specialistId: carrier.specialistId,
        specialistTargetedPlayers: [],
        ownedByPlayerId: firstPlayer._id,
      }
    };

    return {
      id: `Group ${idx}`,
      originalShips: totalShips,
      ships: totalShips,
      isDefender: Boolean(g.star),
      attackAgainst: new Map(), // later
      shipsKilled: 0,
      players,
      star: g.star ? mapStar(g.star) : undefined,
      carriers: g.carriers.map(mapCarrier),
    };
  });

  const isC2S = Boolean(combatGroups.find(cg => Boolean(cg.star)));

  combatService.computeGroupWeapons(game, combatGroups, isC2S);

  return combatGroups;
};
