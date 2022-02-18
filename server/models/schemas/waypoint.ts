const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    source: { type: Types.ObjectId, required: true },
    isCarrier: { type: Types.Boolean, required: true, default: false }, // only true for carriers that target other carriers
    destination: { type: Types.ObjectId, required: true },
    action: { type: Types.String, required: true, enum: ['nothing', 'collectAll', 'dropAll', 'collect', 'drop', 'collectAllBut', 'dropAllBut', 'dropPercentage', 'collectPercentage', 'garrison'], default: 'nothing' },
    actionShips: { type: Types.Number, required: true, default: 0 },
    delayTicks: { type: Types.Number, required: true, default: 0 }
});

export default schema;
