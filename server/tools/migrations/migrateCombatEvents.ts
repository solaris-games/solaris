import {JobParameters} from "../tool";
import EventModel from '../../db/models/Event';
import {
    BasePlayerEvent,
    CombatResultCarrier,
    CombatResultGroup, CombatResultStar, PlayerCombatCarrierEvent,
    PlayerCombatStarEvent,
    Specialist,
    StarCaptureResult, WeaponsDetail
} from "@solaris/common";
import {DBObjectId} from "../../services/types/DBObjectId";
import {logger} from "../../utils/logging";

interface OldCombatWeapons {
    defender: number;
    defenderBase: number;
    attacker: number;
    attackerBase: number;
};

interface OldCombatPart {
    defender: number;
    attacker: number;
};

interface OldCombatStar<ID> {
    _id: ID;
    ownedByPlayerId: ID | null;
    specialist: Specialist | null;
    before: number | string;
    lost: number | string;
    after: number | string;
    scrambled: boolean;
};

interface OldCombatCarrier<ID> {
    _id: ID;
    name: string;
    ownedByPlayerId: ID;
    specialist: Specialist | null;
    before: number | string;
    lost: number | string;
    after: number | string;
    scrambled: boolean;
};

interface OldCombatResultShips {
    weapons: OldCombatWeapons;
    before: OldCombatPart;
    after: OldCombatPart;
    lost: OldCombatPart;
    needed?: OldCombatPart | null;
};

interface OldCombatResult<ID> extends OldCombatResultShips {
    star: OldCombatStar<ID> | null;
    carriers: OldCombatCarrier<ID>[];
};

interface OldCombatEventData<ID> {
    playerIdDefenders: ID[];
    playerIdAttackers: ID[];
    combatResult: OldCombatResult<ID>;
}

interface OldPlayerCombatStarEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCombatStar';
    data: OldCombatEventData<ID> & {
        playerIdOwner: ID;
        starId: ID;
        starName: string;
        captureResult: StarCaptureResult<ID>;
    };
}

interface OldPlayerCombatCarrierEvent<ID> extends BasePlayerEvent<ID> {
    type: 'playerCombatCarrier',
    data: OldCombatEventData<ID>,
}

const log = logger("Migrate combat events");

const processStarCombatEvent = async (oldEvent: OldPlayerCombatStarEvent<DBObjectId>) => {
    const mapCarrier = (oldC: OldCombatCarrier<DBObjectId>): CombatResultCarrier<DBObjectId> => {
        return {
            carrierId: oldC._id,
            carrierName: oldC.name,
            ownedByPlayerId: oldC.ownedByPlayerId,
            specialistId: oldC.specialist?.id || null,
            hasScrambler: oldC.before === '???',
            shipsAfter: oldC.after as any,
            shipsBefore: oldC.before as any,
            shipsLost: oldC.lost as any,
        };
    };

    const mapStar = (oldS: OldCombatStar<DBObjectId>): CombatResultStar<DBObjectId> => {
        return {
            starId: oldS._id,
            starName: oldEvent.data.starName,
            ownedByPlayerId: oldEvent.data.playerIdOwner,
            specialistId: oldEvent.data.combatResult.star?.specialist?.id || null,
            hasScrambler: oldS.before === '???',
            captureResult: oldEvent.data.captureResult,
            shipsAfter: oldS.after as any,
            shipsBefore: oldS.before as any,
            shipsLost: oldS.lost as any,
        };
    };

    const defenderAttackMap: Record<number, WeaponsDetail> = {};
    defenderAttackMap[1] = {
        total: oldEvent.data.combatResult.weapons.defender,
        appliedBuffs: [],
        weaponsBuff: oldEvent.data.combatResult.weapons.defender - oldEvent.data.combatResult.weapons.defenderBase,
        weaponsLevel: oldEvent.data.combatResult.weapons.defenderBase,
    };

    const defenderGroup: CombatResultGroup<DBObjectId> = {
        playerIds: oldEvent.data.playerIdDefenders,
        carriers: oldEvent.data.combatResult.carriers.filter(c => oldEvent.data.playerIdDefenders.find(pi => pi.toString() === c.ownedByPlayerId.toString())).map(mapCarrier),
        star: oldEvent.data.combatResult.star ? mapStar(oldEvent.data.combatResult.star) : undefined,
        shipsBefore: oldEvent.data.combatResult.before.defender,
        shipsAfter: oldEvent.data.combatResult.after.defender,
        shipsLost: oldEvent.data.combatResult.lost.defender,
        attackAgainst: defenderAttackMap,
    }

    const attackerAttackMap: Record<number, WeaponsDetail> = {};
    attackerAttackMap[0] = {
        total: oldEvent.data.combatResult.weapons.attacker,
        appliedBuffs: [],
        weaponsBuff: oldEvent.data.combatResult.weapons.attacker - oldEvent.data.combatResult.weapons.attackerBase,
        weaponsLevel: oldEvent.data.combatResult.weapons.attackerBase,
    };

    const attackerGroup = {
        playerIds: oldEvent.data.playerIdAttackers,
        carriers: oldEvent.data.combatResult.carriers.filter(c => oldEvent.data.playerIdAttackers.find(pi => pi.toString() === c.ownedByPlayerId.toString())).map(mapCarrier),
        star: undefined,
        shipsBefore: oldEvent.data.combatResult.before.attacker,
        shipsAfter: oldEvent.data.combatResult.after.attacker,
        shipsLost: oldEvent.data.combatResult.lost.attacker,
        attackAgainst: attackerAttackMap,
    };

    const newResult = {
        groups: [defenderGroup, attackerGroup],
    };

    const newEvent = oldEvent as any as PlayerCombatStarEvent<DBObjectId>;
    newEvent.data = newResult;
    // @ts-ignore
    newEvent.markModified('data');
    // @ts-ignore
    await newEvent.save();
}

const processCarrierCombatEvent = async (oldEvent: OldPlayerCombatCarrierEvent<DBObjectId>) => {
    const mapCarrier = (oldC: OldCombatCarrier<DBObjectId>): CombatResultCarrier<DBObjectId> => {
        return {
            carrierId: oldC._id,
            carrierName: oldC.name,
            ownedByPlayerId: oldC.ownedByPlayerId,
            specialistId: oldC.specialist?.id || null,
            hasScrambler: oldC.before === '???',
            shipsAfter: oldC.after as any,
            shipsBefore: oldC.before as any,
            shipsLost: oldC.lost as any,
        };
    };

    const defenderAttackMap: Record<number, WeaponsDetail> = {};
    defenderAttackMap[1] = {
        total: oldEvent.data.combatResult.weapons.defender,
        appliedBuffs: [],
        weaponsBuff: oldEvent.data.combatResult.weapons.defender - oldEvent.data.combatResult.weapons.defenderBase,
        weaponsLevel: oldEvent.data.combatResult.weapons.defenderBase,
    };

    const defenderGroup: CombatResultGroup<DBObjectId> = {
        playerIds: oldEvent.data.playerIdDefenders,
        carriers: oldEvent.data.combatResult.carriers.filter(c => oldEvent.data.playerIdDefenders.find(pi => pi.toString() === c.ownedByPlayerId.toString())).map(mapCarrier),
        star: undefined,
        shipsBefore: oldEvent.data.combatResult.before.defender,
        shipsAfter: oldEvent.data.combatResult.after.defender,
        shipsLost: oldEvent.data.combatResult.lost.defender,
        attackAgainst: defenderAttackMap,
    }

    const attackerAttackMap: Record<number, WeaponsDetail> = {};
    attackerAttackMap[0] = {
        total: oldEvent.data.combatResult.weapons.attacker,
        appliedBuffs: [],
        weaponsBuff: oldEvent.data.combatResult.weapons.attacker - oldEvent.data.combatResult.weapons.attackerBase,
        weaponsLevel: oldEvent.data.combatResult.weapons.attackerBase,
    };

    const attackerGroup = {
        playerIds: oldEvent.data.playerIdAttackers,
        carriers: oldEvent.data.combatResult.carriers.filter(c => oldEvent.data.playerIdAttackers.find(pi => pi.toString() === c.ownedByPlayerId.toString())).map(mapCarrier),
        star: undefined,
        shipsBefore: oldEvent.data.combatResult.before.attacker,
        shipsAfter: oldEvent.data.combatResult.after.attacker,
        shipsLost: oldEvent.data.combatResult.lost.attacker,
        attackAgainst: attackerAttackMap,
    };

    const newResult = {
        groups: [defenderGroup, attackerGroup],
    };

    const newEvent = oldEvent as any as PlayerCombatCarrierEvent<DBObjectId>;
    newEvent.data = newResult;
    // @ts-ignore
    newEvent.markModified('data');
    // @ts-ignore
    await newEvent.save();
}

const migrateEvents = async <T>(ctx: JobParameters, process: (ev: T) => Promise<void>, type: string) => {
    const QUERY = { type };

    log.info(`Migrating events of type: ${type}`);

    const eventRepo = ctx.container.eventService.eventRepo;

    const pageSize = 50;
    const total = await eventRepo.count(QUERY);
    const totalPages = Math.ceil(total / pageSize);
    let page = 0;

    do {
        const events: T[] = await eventRepo.findAsModels(QUERY, {}, { _id: 1 }, pageSize, page * pageSize);

        for (let event of events) {
            process(event);
        }

        log.info(`Page ${page}/${totalPages}`);

        page++;
    } while (page <= totalPages)

    log.info(`FINISHED migrating events of type: ${type}`);
}

export const migrateCombatEvents = async (ctx: JobParameters) => {
    await migrateEvents(ctx, processStarCombatEvent, 'playerCombatStar');
    await migrateEvents(ctx, processCarrierCombatEvent, 'playerCombatCarrier');
};
