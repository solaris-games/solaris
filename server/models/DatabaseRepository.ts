import { ObjectId } from "mongoose";

export default class DatabaseRepository<T> {

    model: any;
    
    constructor(model) {
        this.model = model;
    }

    async findById(id: ObjectId, select: any): Promise<T | null> {
        return await this.model.findById(id, select)
        .lean({ defaults: true })
        .exec();
    }

    async findByIdAsModel(id: ObjectId, select: any): Promise<any | null> {
        return await this.model.findById(id, select).exec();
    }

    async find(query: any, select: any, sort: any | null = null, limit: number | null = null, skip: number | null = null): Promise<T[]> {
        return await this.model.find(query, select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ defaults: true })
        .exec();
    }

    async findAsModels(query: any, select: any, sort: any | null = null, limit: number | null = null, skip: number | null = null): Promise<any[]> {
        return await this.model.find(query, select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();
    }

    async findOne(query: any, select: any): Promise<T | null> {
        return await this.model.findOne(query, select)
        .lean({ defaults: true })
        .exec();
    }

    async findOneAsModel(query: any, select: any): Promise<any | null> {
        return await this.model.findOne(query, select)
        .exec();
    }

    async count(query: any): Promise<number> {
        return await this.model.countDocuments(query).exec();
    }

    async countAll(): Promise<number> {
        return this.model.estimatedDocumentCount();
    }

    async updateOne(query: any, update: any, options: any | null = null): Promise<void> {
        return await this.model.updateOne(query, update, options).exec();
    }

    async updateMany(query: any, update: any, options: any | null = null): Promise<void> {
        return await this.model.updateMany(query, update, options).exec();
    }

    async bulkWrite(updates: any[]): Promise<void> {
        return await this.model.bulkWrite(updates);
    }

    async deleteOne(query: any): Promise<void> {
        return await this.model.deleteOne(query).exec();
    }

    async deleteMany(query: any): Promise<void> {
        return await this.model.deleteMany(query).exec();
    }

    objectIdFromDate(date: Date) {
        return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
    }
    
    dateFromObjectId(objectId: ObjectId | string) {
        return new Date(parseInt(objectId.toString().substring(0, 8), 16) * 1000);
    }

};
