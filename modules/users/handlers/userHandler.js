const auth = require('../../../core/middleware/auth');
const { LoginService } = require('../services/loginService');
const { UserService } = require('../services/userService');

class UserHandler {
    static create = async function (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.name && req.body.role && req.body.username && req.body.password))
                return res.status(400).send('Incomplete information entered');
            const out = LoginService.create(req.body.name, 
                req.body.phone, 
                req.body.role, 
                req.body.username, 
                req.body.password, 
                req.user.user_id);
            return res.status(out.statusCode).send(out.data);
        } catch (err) {
            return res.status(err.statusCode).send(err.data);
        }
    }

    static update_creds = async function (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');
            const out = LoginService.update_creds(req.body.user_id,
                req.body.username,
                req.body.password,
                req.user.user_id);
                return res.status(out.statusCode).send(out.data);
        } catch (err) {
            return res.status(err.statusCode).send(err.data);
        }
    }

    static delete = async function (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');
            const out = UserService.delete(req.body.user_id, req.user.user_id);
        } catch (err) {
            return res.status(err.statusCode).send(err.data);
        }
    }

    static init = function(router) {
        router.put('/user/create', auth, UserHandler.create);

        router.post('/user/update_creds', auth, UserHandler.update_creds);

        router.post('/user/delete', auth, UserHandler.delete);
    }
}

module.exports = {
    UserHandler: UserHandler
};