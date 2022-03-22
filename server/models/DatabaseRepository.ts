import { DBObjectId } from "../types/DBObjectId";

export default class DatabaseRepository<T> {

    model;
    
    constructor(model) {
        this.model = model;
    }

    async findById(id: DBObjectId, select?): Promise<T | null> {
        return await this.model.findById(id, select)
        .lean({ defaults: true })
        .exec();
    }

    async findByIdAsModel(id: DBObjectId, select?): Promise<any | null> {
        return await this.model.findById(id, select).exec();
    }

    async find(query, select?: any | null, sort?: any | null, limit?: number | null, skip?: number | null): Promise<T[]> {
        return await this.model.find(query, select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ defaults: true })
        .exec();
    }

    async findAsModels(query, select?, sort?, limit?: number, skip?: number): Promise<any[]> {
        return await this.model.find(query, select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();
    }

    async findOne(query, select?): Promise<T | null> {
        return await this.model.findOne(query, select)
        .lean({ defaults: true })
        .exec();
    }

    async findOneAsModel(query, select?): Promise<any | null> {
        return await this.model.findOne(query, select)
        .exec();
    }

    async count(query): Promise<number> {
        return await this.model.countDocuments(query).exec();
    }

    async countAll(): Promise<number> {
        return this.model.estimatedDocumentCount();
    }

    async updateOne(query, update, options?): Promise<void> {
        return await this.model.updateOne(query, update, options).exec();
    }

    async updateMany(query, update, options?): Promise<void> {
        return await this.model.updateMany(query, update, options).exec();
    }

    async bulkWrite(updates): Promise<void> {
        return await this.model.bulkWrite(updates);
    }

    async deleteOne(query): Promise<void> {
        return await this.model.deleteOne(query).exec();
    }

    async deleteMany(query): Promise<void> {
        return await this.model.deleteMany(query).exec();
    }

    async insertOne(document): Promise<void> {
        return await this.bulkWrite([
            {
                insertOne: {
                    document
                }
            }
        ]);
    }

    objectIdFromDate(date: Date) {
        return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
    }
    
    dateFromObjectId(objectId: DBObjectId | string) {
        return new Date(parseInt(objectId.toString().substring(0, 8), 16) * 1000);
    }

};
