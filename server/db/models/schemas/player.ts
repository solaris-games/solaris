import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

import ActionSchema from './action';

const schema = new Schema({
    userId: {type: Types.ObjectId, required: false, default: null},
    homeStarId: {type: Types.ObjectId, required: true},
    alias: {type: Types.String, required: true},
    avatar: {type: Types.String, required: false, default: null},
    notes: {type: Types.String, required: false, default: null},
    colour: {
        alias: {type: Types.String, required: true},
        value: {type: Types.String, required: true}
    },
    shape: {type: Types.String, required: true, enum: ['circle', 'square', 'diamond', 'hexagon'], default: 'circle'},
    lastSeen: {type: Types.Date, required: false, default: null},
    lastSeenIP: {type: Types.String, required: false, default: null},
    researchingNow: {type: Types.String, required: true, default: 'weapons'},
    researchingNext: {type: Types.String, required: true, default: 'weapons'},
    credits: {type: Types.Number, required: true},
    creditsSpecialists: {type: Types.Number, required: true},
    isOpenSlot: {type: Types.Boolean, required: true, default: true},
    defeated: {type: Types.Boolean, required: false, default: false}, // TODO: We can remove this in favour of using defeatedDate below.
    defeatedDate: {type: Types.Date, required: false, default: null},
    afk: {type: Types.Boolean, required: false, default: false},      // TODO: Same treatment as with defeatedDate.
    aiState: {type: Types.Mixed, required: false, default: null},
    renownToGive: {type: Types.Number, required: true, default: 8},
    ready: {type: Types.Boolean, required: false, default: false},
    readyToCycle: {type: Types.Boolean, required: false, default: false},
    readyToQuit: {type: Types.Boolean, required: false, default: false},
    missedTurns: {type: Types.Number, required: false, default: 0},
    hasSentTurnReminder: {type: Types.Boolean, required: false, default: false},
    hasFilledAfkSlot: {type: Types.Boolean, required: false, default: false},
    spectators: [{type: Types.ObjectId, required: false, default: []}], // User ids
    research: {
        // TODO: This would be arguably better if it was just progress points and remove level
        // and then we can calculate the level before sending it to the client.
        scanning: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        },
        hyperspace: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        },
        terraforming: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        },
        experimentation: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        },
        weapons: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        },
        banking: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        },
        manufacturing: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        },
        specialists: {
            level: {type: Types.Number, required: true, default: 1},
            progress: {type: Types.Number, required: true, default: 0},
        }
    },
    ledger: {
        credits: [
            {
                playerId: {type: Types.ObjectId, required: true},
                debt: {type: Types.Number, required: true, default: 0}
            }
        ],
        creditsSpecialists: [
            {
                playerId: {type: Types.ObjectId, required: true},
                debt: {type: Types.Number, required: true, default: 0}
            }
        ],
    },
    reputations: [
        {
            playerId: {type: Types.ObjectId, required: true},
            score: {type: Types.Number, required: true, default: 0}
        }
    ],
    diplomacy: [
        {
            playerId: {type: Types.ObjectId, required: true},
            status: {type: Types.String, required: true}
        }
    ],
    scheduledActions: [ActionSchema],
    colourMapping: {
        type: Types.Map, of: {
            alias: {type: Types.String, required: true},
            value: {type: Types.String, required: true}
        },
        required: false, default: null
    }
});

export default schema;
