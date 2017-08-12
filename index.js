'use strict';

const feathers = require('feathers');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const async = require('async');
const dbPath = './data/users.db';

const app = feathers().configure(services);
const userService = app.service('/users');

function services() {
    this.use('/users', service({ Model: userModel() }));
    function userModel() {
        return new NeDB({
            filename: dbPath,
            autoload: true
        });
    }
}

async.series([addTestData], function(err) {
    if (err) {
        throw err;
    }
});

function addTestData(callback) {
    const usersToExist = [
        { email: 'jane.doe@gmail.com', password: '11111', role: 'admin' },
        { email: 'john.doe@gmail.com', password: '22222', role: 'user' },
        { email: 'judy.doe@gmail.com', password: '33333', role: 'user' }
    ];
    async.each(usersToExist, ensureUserExists, callback);
}

function ensureUserExists(user, callback) {
    userService.find({ email: user.email }, userFound);

    function userFound(err, foundUsers) {
        if (err) {
            return callback(err);
        }
        if (foundUsers.length > 0) {
            console.log('User already existed', foundUsers);
            return callback();
        }
        userService.create(user, userCreated);
    }

    function userCreated(err, createdUser) {
        if (err) {
            return callback(err);
        }
        console.log('User created');
        callback();
    }
}

/*
service methods
find(params)
get(id, params)
create(data, params)
update(id, data, params)
patch(id, data, params)
remove(id, params)
*/