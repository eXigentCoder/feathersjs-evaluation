const NeDB = require('nedb');
const dbPath = './data/users.db';
const Ajv = require('ajv');
const authHooks = require('feathers-authentication-local').hooks;
const commonHooks = require('feathers-hooks-common');
const service = require('feathers-nedb');
const { setCreatedAt, setUpdatedAt, unless, discard, validateSchema } = commonHooks;

module.exports = function createUserService(app) {
    const path = '/users';
    app.use(path, service({ Model: userModel() }));
    const userService = app.service(path);
    userService.before({
        create: [validateSchema(userSchema(), Ajv), authHooks.hashPassword(), setCreatedAt(), setUpdatedAt()]
    });
    userService.after({
        all: [unless(hook => hook.method === 'find', discard('password')), customSyncHook, customAsyncHook]
    });
};

function customSyncHook(asd) {
    console.log("I'm a custom sync hook!");
}

function customAsyncHook() {
    return new Promise(function(resolve) {
        setImmediate(() => {
            console.log("I'm a custom async hook!");
            resolve();
        });
    });
}

function userModel() {
    return new NeDB({
        filename: dbPath,
        autoload: true
    });
}

function userSchema() {
    return {
        title: 'User Schema',
        type: 'object',
        required: ['email', 'password', 'role'],
        additionalProperties: false,
        properties: {
            email: { type: 'string', maxLength: 100, minLength: 6 },
            password: { type: 'string', maxLength: 30, minLength: 8 },
            role: { type: 'string' }
        }
    };
}
