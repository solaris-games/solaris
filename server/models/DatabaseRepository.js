module.exports = class DatabaseRepository {

    constructor(model) {
        this.model = model;
    }

    async findById(id, select) {
        return await this.model.findById(id, select)
        .lean({ defaults: true })
        .exec();
    }

    async findByIdAsModel(id, select) {
        return await this.model.findById(id, select).exec();
    }

    async find(query, select, sort = null, limit = null, skip = null) {
        return await this.model.find(query, select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ defaults: true })
        .exec();
    }

    async findAsModels(query, select, sort = null, limit = null, skip = null) {
        return await this.model.find(query, select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec();
    }

    async findOne(query, select) {
        return await this.model.findOne(query, select)
        .lean({ defaults: true })
        .exec();
    }

    async findOneAsModel(query, select) {
        return await this.model.findOne(query, select)
        .exec();
    }

    async count(query) {
        return await this.model.countDocuments(query).exec();
    }

    async countAll() {
        return this.model.estimatedDocumentCount();
    }

    async updateOne(query, update, options = null) {
        return await this.model.updateOne(query, update, options).exec();
    }

    async updateMany(query, update, options = null) {
        return await this.model.updateMany(query, update, options).exec();
    }

    async bulkWrite(updates) {
        return await this.model.bulkWrite(updates);
    }

    async deleteOne(query) {
        return await this.model.deleteOne(query).exec();
    }

    async deleteMany(query) {
        return await this.model.deleteMany(query).exec();
    }

};
