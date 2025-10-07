import CombatService from '../services/combat';
import mongoose from 'mongoose';

describe('damage distribution', () => {

    // @ts-ignore
    const service = new CombatService();

    it('should distribute damage evenly between star and carrier', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 5,
            shipsActual: 5,
            specialistId: null
        };

        let carrier = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrier]
        };

        const damageObjects = [
            star,
            carrier
        ];

        let shipsToKill = 10;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(0);
        expect(star.shipsActual).toBe(0);
        expect(carrier.ships).toBe(5);
    });

    it('should distribute damage evenly between star and multiple carriers', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 6,
            shipsActual: 6,
            specialistId: null
        };

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 6,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 6,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            star,
            carrierA,
            carrierB
        ];

        let shipsToKill = 6;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(4);
        expect(star.shipsActual).toBe(4);
        expect(carrierA.ships).toBe(4);
        expect(carrierB.ships).toBe(4);
    });

    it('should distribute damage evenly between multiple carriers - Destroy carriers', async () => {
        let star = null;

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            carrierA,
            carrierB
        ];

        let shipsToKill = 5;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(carrierA.ships).toBe(0);
        expect(carrierB.ships).toBe(6);
    });

    it('should distribute damage evenly between multiple carriers - Do not destroy carriers', async () => {
        let star = null;

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            carrierA,
            carrierB
        ];

        let shipsToKill = 5;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, false);
        
        expect(remaining).toBe(0);
        expect(carrierA.ships).toBe(1);
        expect(carrierB.ships).toBe(5);
    });

    it('should ignore fleets with 0 ships - star', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 0,
            shipsActual: 0,
            specialistId: null
        };

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            star,
            carrierA,
            carrierB
        ];

        let shipsToKill = 20;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(0);
        expect(star.shipsActual).toBe(0);
        expect(carrierA.ships).toBe(0);
        expect(carrierB.ships).toBe(0);
    });

    it('should ignore fleets with 0 ships - carrier', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            shipsActual: 10,
            specialistId: null
        };

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 0,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            star,
            carrierA,
            carrierB
        ];

        let shipsToKill = 20;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(0);
        expect(star.shipsActual).toBe(0);
        expect(carrierA.ships).toBe(0);
        expect(carrierB.ships).toBe(0);
    });

    it('should distribute damage evenly between star and carrier but keep carriers alive', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 5,
            shipsActual: 5,
            specialistId: null
        };

        let carrier = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrier]
        };

        const damageObjects = [
            star,
            carrier
        ];

        let shipsToKill = 15;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, false);
        
        expect(remaining).toBe(1);
        expect(star.ships).toBe(0);
        expect(star.shipsActual).toBe(0);
        expect(carrier.ships).toBe(1);
    });

    it('should distribute damage to largest fleets first - star', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 100,
            shipsActual: 100,
            specialistId: null
        };

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 5,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            star,
            carrierA,
            carrierB
        ];

        let shipsToKill = 114;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(1);
        expect(star.shipsActual).toBe(1);
        expect(carrierA.ships).toBe(0);
        expect(carrierB.ships).toBe(0);
    });

    it('should distribute damage to largest fleets first - carrier', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 10,
            shipsActual: 10,
            specialistId: null
        };

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 100,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 5,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            star,
            carrierA,
            carrierB
        ];

        let shipsToKill = 114;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(0);
        expect(star.shipsActual).toBe(0);
        expect(carrierA.ships).toBe(1);
        expect(carrierB.ships).toBe(0);
    });

    it('should distribute damage to non-specialists first - star specialist', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            shipsActual: 1,
            specialistId: 1
        };

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            specialistId: null
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            star,
            carrierA,
            carrierB
        ];

        let shipsToKill = 2;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(1);
        expect(star.shipsActual).toBe(1);
        expect(carrierA.ships).toBe(0);
        expect(carrierB.ships).toBe(0);
    });

    it('should distribute damage to non-specialists first - star specialist', async () => {
        let star = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            shipsActual: 1,
            specialistId: null
        };

        let carrierA = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            specialistId: 1
        };

        let carrierB = {
            _id: new mongoose.Types.ObjectId(),
            ships: 1,
            specialistId: null
        };

        const combatResult = {
            star,
            carriers: [carrierA, carrierB]
        };

        const damageObjects = [
            star,
            carrierA,
            carrierB
        ];

        let shipsToKill = 2;

        // @ts-ignore
        let remaining = service._distributeDamage(combatResult, damageObjects, shipsToKill, true);
        
        expect(remaining).toBe(0);
        expect(star.ships).toBe(0);
        expect(star.shipsActual).toBe(0);
        expect(carrierA.ships).toBe(1);
        expect(carrierB.ships).toBe(0);
    });

});
