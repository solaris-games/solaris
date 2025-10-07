import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const Types = Schema.Types;

const schema = new Schema({
    userId: { type: Types.ObjectId, required: true },
    paymentId: { type: Types.String, required: true },
    totalCost: { type: Types.Number, required: true },
    totalQuantity: { type: Types.Number, required: true },
    unitCost: { type: Types.Number, required: true }
});

schema.index({paymentId: 1}, {unique: false});

export default schema;
