const feathers = require('feathers');
const async = require('async');
const hooks = require('feathers-hooks');
const createUserService = require('./create-user-service');
const util = require('util');

const app = feathers().configure(hooks()).configure(services);

function services() {
    let app = this;
    createUserService(app);
}

//can add global hooks too:
if (process.env.DEBUG) {
    app.hooks({
        before: {
            all: serviceCalled
        },
        after: {
            all: serviceComplete
        },
        error: {
            all: serviceError
        }
    });
}

function serviceCalled({ type, method, path, params }) {
    console.log('%s %s %s serviceCalled with params:', type, method, path, params);
}

function serviceComplete({ type, method, path, original, result }) {
    console.log('%s %s %s serviceComplete, result:', type, method, path, util.inspect(original), util.inspect(result));
}

function serviceError({ error, type, method, path, params }) {
    console.error('%s on %s %s with params:%s \n\n', type, method, path, util.inspect(params), error);
}

const userService = app.service('/users');

async.series([addTestData], function(err) {
    if (err) {
        console.error(err);
        throw err;
    }
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
