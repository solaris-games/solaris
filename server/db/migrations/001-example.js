module.exports = {
    async migrate(db) {
        // Use the collection function to get the desired collection to modify
        // const users = db.collection('users');

        // Migrate the database, for example:
        // await users.updateOne({
        //     username: 'Hyperi0n'
        // }, {
        //     $set: {
        //         'roles.administrator': true
        //     }
        // });

        // NOTE: All migrations must be IDEMPOTENT - It can be run multiple times without changing
        // the result beyond the initial execution of the script.
    }
};
