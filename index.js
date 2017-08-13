'use strict';
const feathers = require('feathers');
const async = require('async');
const hooks = require('feathers-hooks');
const createUserService = require('./create-user-service');

const app = feathers().configure(hooks()).configure(services);

function services() {
    let app = this;
    createUserService(app);
}

const userService = app.service('/users');

async.series([addTestData], function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    process.exit(0);
});

function addTestData(callback) {
    const usersToExist = [
        { email: 'jane.doe@gmail.com', password: '11111111', role: 'admin' },
        { email: 'john.doe@gmail.com', password: '22222222', role: 'user' },
        { email: 'judy.doe@gmail.com', password: '33333333', role: 'user' }
    ];
    async.each(usersToExist, ensureUserExists, callback);
}

function ensureUserExists(user, callback) {
    userService.find({ query: { email: user.email } }, userFound);

    function userFound(err, foundUsers) {
        if (err) {
            return callback(err);
        }
        if (foundUsers.length > 0) {
            console.log('User "%s" already existed.', foundUsers[0].email);
            return callback();
        }
        userService.create(user, userCreated);
    }

    function userCreated(err, createdUser) {
        if (err) {
            return callback(err);
        }
        if (!createdUser) {
            return callback(new Error('createdUser was falsy'));
        }
        console.log('User "%s" created.', createdUser.email);
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
