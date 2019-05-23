const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    username: { type: Types.String, required: true },
    email: { type: Types.String, required: true },
    emailEnabled: { type: Types.Boolean, default: true },
    password: { type: Types.String, required: true },
    credits: { type: Types.Number, default: 0 },
    premiumEndDate: { type: Types.Date, default: null },
    achievements: {
        victories: { type: Types.Number, default: 0 },
        rank: { type: Types.Number, default: 0 },
        renown: { type: Types.Number, default: 0 },
        badges: {
            conqueror: { type: Types.Number, default: 0 },
            cutthroatPirate: { type: Types.Number, default: 0 },
            deadSetBadass: { type: Types.Number, default: 0 },
            masterStrategist: { type: Types.Number, default: 0 },
            wordsmith: { type: Types.Number, default: 0 },
            lionheart: { type: Types.Number, default: 0 },
            luckyDevil: { type: Types.Number, default: 0 },
            sliceOfCheese: { type: Types.Number, default: 0 },
            ironborn: { type: Types.Number, default: 0 },
            quickDraw: { type: Types.Number, default: 0 },
            sentinel: { type: Types.Number, default: 0 },
            madScientist: { type: Types.Number, default: 0 },
            strangeOne: { type: Types.Number, default: 0 },
            toxic: { type: Types.Number, default: 0 },
            topAlly: { type: Types.Number, default: 0 }
        }
    }
});

module.exports = schema;
