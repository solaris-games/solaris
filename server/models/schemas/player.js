const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    userId: { type: Types.String, required: false, default: null }, // TODO: This should be an object id
    homeStarId: { type: Types.ObjectId, required: true },
    alias: { type: Types.String, required: true },
    avatar: { type: Types.String, required: false, default: null },
    notes: { type: Types.String, required: false, default: null },
    colour: {
        alias: { type: Types.String, required: true },
        value: { type: Types.String, required: true }
    },
    shape: { type: Types.String, required: true, enum: ['circle', 'square', 'diamond', 'hexagon'], default: 'circle' },
    lastSeen: { type: Types.Date, required: false },
    lastSeenIP: { type: Types.String, required: false },
    researchingNow: { type: Types.String, required: true, default: 'weapons' },
    researchingNext: { type: Types.String, required: true, default: 'weapons' },
    credits: { type: Types.Number, required: true },
    creditsSpecialists: { type: Types.Number, required: true },
    defeated: { type: Types.Boolean, required: false, default: false }, // TODO: We can remove this in favour of using defeatedDate below.
    defeatedDate: { type: Types.Date, required: false, default: null },
    afk: { type: Types.Boolean, required: false, default: false },      // TODO: Same treatment as with defeatedDate.
    renownToGive: { type: Types.Number, required: true, default: 8 },
    ready: { type: Types.Boolean, required: false, default: false },
    readyToQuit: { type: Types.Boolean, required: false, default: false },
    missedTurns: { type: Types.Number, required: false, default: 0 },
    hasSentTurnReminder: { type: Types.Boolean, required: false, default: false },
    research: {
        // TODO: This would be arguably better if it was just progress points and remove level
        // and then we can calculate the level before sending it to the client.
        scanning: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        },
        hyperspace: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        },
        terraforming: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        },
        experimentation: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        },
        weapons: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        },
        banking: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        },
        manufacturing: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        },
        specialists: {
            level: { type: Types.Number, required: true, default: 1  },
            progress: { type: Types.Number, required: true, default: 0  },
        }
    },
    ledger: [
        {
            playerId: { type: Types.ObjectId, required: true },
            debt: { type: Types.Number, required: true, default: 0  }
        }
    ],
    reputations: [
        {
            playerId: { type: Types.ObjectId, required: true },
            score: { type: Types.Number, required: true, default: 0  }
        }
    ]
});

module.exports = schema;
