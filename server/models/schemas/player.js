const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    userId: { type: Types.String, required: false, default: null }, // TODO: This should be an object id
    homeStarId: { type: Types.ObjectId, required: true },
    alias: { type: Types.String, required: true },
    colour: {
        alias: { type: Types.String, required: true },
        value: { type: Types.String, required: true }
    },
    lastSeen: { type: Types.Date, required: false },
    researchingNow: { type: Types.String, required: true, default: 'weapons' },
    researchingNext: { type: Types.String, required: true, default: 'weapons' },
    credits: { type: Types.Number, required: true },
    defeated: { type: Types.Boolean, required: false, default: false },
    renownToGive: { type: Types.Number, required: true, default: 8 },
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
        }
    }
});

module.exports = schema;
