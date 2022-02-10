import { DBObjectId } from "./DBObjectId";

export interface Payment {
    _id: DBObjectId;
    userId: DBObjectId;
    paymentId: string;
    totalCost: number;
    totalQuantity: number;
    unitCost: number;
};
