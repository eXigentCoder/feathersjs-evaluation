const NeDB = require('nedb');
const dbPath = './data/users.db';
const Ajv = require('ajv');
const authHooks = require('feathers-authentication-local').hooks;
const commonHooks = require('feathers-hooks-common');
const service = require('feathers-nedb');
const { setCreatedAt, setUpdatedAt, unless, remove, validateSchema } = commonHooks;

module.exports = function createUserService(app) {
    const path = '/users';
    const userServiceMiddleware = service({ Model: userModel() });
    app.use(path, userServiceMiddleware);
    const userService = app.service(path);
    userService.before({
        create: [validateSchema(userSchema(), Ajv), authHooks.hashPassword(), setCreatedAt(), setUpdatedAt()]
    });
    userService.after({
        all: unless(hook => hook.method === 'find', remove('password'))
    });
};

function userModel() {
    return new NeDB({
        filename: dbPath,
        autoload: true
    });
}

function userSchema() {
    return {
        title: 'User Schema',
        //$schema: 'http://json-schema.org/draft-04/schema#',
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
