const User = require('./db/models/User');
const bcrypt = require('bcrypt');

module.exports = {

    getMe(id, callback) {
        User.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            premiumEndDate: 0
        }, (err, user) => {
            if (err) {
                return callback(err);
            }
    
            return callback(null, user);
        });
    },

    getById(id, callback) {
        User.findById(id, {
            // Remove fields we don't want to send back.
            password: 0,
            premiumEndDate: 0,
            credits: 0,
            email: 0,
            emailEnabled: 0,
            username: 0
        }, (err, user) => {
            if (err) {
                return callback(err);
            }
    
            return callback(null, user);
        });
    },

    create(user, callback) {
        const newUser = new User(user);
    
        bcrypt.hash(newUser.password, 10, (err, hash) => {
            if (err) {
                return callback(err);
            }
    
            newUser.password = hash;
    
            newUser.save((err, doc) => {
                if (err) {
                    return callback(err)
                } else {
                    return callback(null, {id: doc._id});
                }
            });
        });
    },

    userExists(username, callback) {
        User.findOne({
            username: username
        })
        .exec((err, user) => {
            if (err) {
                return callback(err);
            }
    
            return callback(null, user != null);
        });
    },

    updateEmailPreference(id, preference, callback) {
        User.findById(id, (err, user) => {
            if (err) {
                return callback(err);
            }
    
            user.emailEnabled = preference;
    
            user.save((err, doc) => {
                if (err) {
                    return callback(err);
                }
    
                return callback(null);
            });
        });
    },

    updateEmailAddress(id, email, callback) {
        User.findById(id, (err, user) => {
            if (err) {
                return callback(err);
            }
    
            user.email = email;
    
            user.save((err, doc) => {
                if (err) {
                    return callback(err);
                }
    
                return callback(null);
            });
        });
    },

    updatePassword(id, currentPassword, newPassword, callback) {
        User.findById(id, (err, user) => {
            if (err) {
                return callback(err);
            }
    
            // Make sure the current password matches.
            bcrypt.compare(currentPassword, user.password, (err, result) => {
                if (err) {
                    return callback(err);
                }

                if (result) {
                    // Update the current password to the new password.
                    bcrypt.hash(newPassword, 10, (err, hash) => {
                        if (err) {
                            return callback(err);
                        }
                
                        user.password = hash;
                
                        user.save((err, doc) => {
                            if (err) {
                                return callback(err)
                            } else {
                                return callback(null);
                            }
                        });
                    });
                } else {
                    return callback({
                        errors: [
                            'The current password is incorrect.'
                        ]
                    });
                }
            });
        });
    },

    clearData(callback) {
        User.deleteMany({}, callback);
    }

};
