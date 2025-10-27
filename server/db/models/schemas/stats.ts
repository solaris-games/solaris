import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = {
    combat: {
        kills: {
            ships: {type: Types.Number, default: 0},
            carriers: {type: Types.Number, default: 0},
            specialists: {type: Types.Number, default: 0},
        },
        losses: {
            ships: {type: Types.Number, default: 0},
            carriers: {type: Types.Number, default: 0},
            specialists: {type: Types.Number, default: 0},
        },
        stars: {
            captured: {type: Types.Number, default: 0},
            lost: {type: Types.Number, default: 0},
        },
        homeStars: {
            captured: {type: Types.Number, default: 0},
            lost: {type: Types.Number, default: 0},
        }
    },
    infrastructure: {
        economy: {type: Types.Number, default: 0},
        industry: {type: Types.Number, default: 0},
        science: {type: Types.Number, default: 0},
        warpGates: {type: Types.Number, default: 0},
        warpGatesDestroyed: {type: Types.Number, default: 0},
        carriers: {type: Types.Number, default: 0},
        specialistsHired: {type: Types.Number, default: 0},
    },
    research: {
        scanning: {type: Types.Number, default: 0},
        hyperspace: {type: Types.Number, default: 0},
        terraforming: {type: Types.Number, default: 0},
        experimentation: {type: Types.Number, default: 0},
        weapons: {type: Types.Number, default: 0},
        banking: {type: Types.Number, default: 0},
        manufacturing: {type: Types.Number, default: 0},
        specialists: {type: Types.Number, default: 0}
    },
    trade: {
        creditsSent: {type: Types.Number, default: 0},
        creditsReceived: {type: Types.Number, default: 0},
        creditsSpecialistsSent: {type: Types.Number, default: 0},
        creditsSpecialistsReceived: {type: Types.Number, default: 0},
        technologySent: {type: Types.Number, default: 0},
        technologyReceived: {type: Types.Number, default: 0},
        giftsSent: {type: Types.Number, default: 0},
        giftsReceived: {type: Types.Number, default: 0},
    },
};

export default schema;