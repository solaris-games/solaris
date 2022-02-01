import { ObjectId } from "mongoose";

export interface Payment {
    _id?: ObjectId;
    userId: ObjectId;
    paymentId: string;
    totalCost: number;
    totalQuantity: number;
    unitCost: number;
};
