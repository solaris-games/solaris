import { Document, EnforceDocument, LeanDocument, Model, Query, QueryOptions, UpdateQuery } from "mongoose";
import { DBObjectId } from "./types/DBObjectId";

export default class Repository<T> {

    model: Model<T>;
    
    constructor(model) {
        this.model = model;
    }

    async findById(id: DBObjectId, select?): Promise<T | null> {
        return await this.model.findById(id, select)
        .lean({ defaults: true })
        .exec() as T;
    }

    async findByIdAsModel(id: DBObjectId, select?): Promise<any | null> {
        return await this.model.findById(id, select).exec();
    }

    async find(query, select?: any | null, sort?: any | null, limit?: number | null, skip?: number | null, defaults: boolean = true): Promise<T[]> {
        // TODO: The allowDiskUse() method was added to Mongoose in 5.12.8 (https://github.com/Automattic/mongoose/issues/10177), but
        // the Typescript type definition for the method was only added in 6.0.9 (https://github.com/Automattic/mongoose/pull/10791).
        // This horrible bodge ensures that this all works with Typescript, and can be removed once we update Mongoose to version 6.0.9 or above.
        type T1 = Query<T extends Document<any, any, any> ? LeanDocument<EnforceDocument<T, {}>>[] : T[], EnforceDocument<T, {}>, {}, T> & { allowDiskUse(value: boolean): Query<T extends Document<any, any, any> ? LeanDocument<EnforceDocument<T, {}>>[] : T[], EnforceDocument<T, {}>, {}, T> } ;

        return await (this.model.find(query, select)
        .sort(sort)
        .skip(skip!) // We lie and say skip won't be null.  The reality is that skip() can accept null values just fine.
        .limit(limit!) // We lie and say limit won't be null.  The reality is that limit() can accept null values just fine.
        .lean({ defaults }) as T1)
        .allowDiskUse(true)
        .exec() as T[];
    }

    async findAsModels(query, select?, sort?, limit?: number, skip?: number): Promise<any[]> {
        return await this.model.find(query, select)
        .sort(sort)
        .skip(skip!) // We lie and say skip won't be null.  The reality is that skip() can accept null values just fine.
        .limit(limit!) // We lie and say limit won't be null.  The reality is that limit() can accept null values just fine.
        .exec();
    }

    async findOrCreateAsModel(query, createValue: Omit<T, '_id'>): Promise<T> {
        const update: UpdateQuery<T> = {
            $setOnInsert: createValue,
        } as UpdateQuery<T>;

        return await this.model.findOneAndUpdate(query, update, {
            upsert: true,
            new: true,
        }).exec() as T;
    }

    async findOne(query, select?, options?: QueryOptions): Promise<T | null> {
        return await this.model.findOne(query, select, options)
        .lean({ defaults: true })
        .exec() as T;
    }

    async findOneAsModel(query, select?): Promise<T | null> {
        return await this.model.findOne(query, select)
        .exec();
    }

    async count(query): Promise<number> {
        return await this.model.countDocuments(query).exec();
    }

    async countAll(): Promise<number> {
        return await this.model.estimatedDocumentCount().exec();
    }

    async updateOne(query, update, options?): Promise<void> {
        await this.model.updateOne(query, update, options).exec();
    }

    async updateMany(query, update, options?): Promise<void> {
        await this.model.updateMany(query, update, options).exec();
    }

    async bulkWrite(updates): Promise<void> {
        await this.model.bulkWrite(updates);
    }

    async deleteOne(query): Promise<void> {
        await this.model.deleteOne(query).exec();
    }

    async deleteMany(query): Promise<void> {
        await this.model.deleteMany(query).exec();
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
