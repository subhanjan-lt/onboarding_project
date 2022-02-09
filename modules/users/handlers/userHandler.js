const auth = require('../../../core/middleware/auth');
const { LoginService } = require('../services/loginService');
const { UserService } = require('../services/userService');

class UserHandler {

    static async create (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.name && req.body.role && req.body.username && req.body.password))
                return res.status(400).send('Incomplete information entered');
            const out = await UserService.create(req.body.name, 
                req.body.phone, 
                req.body.role, 
                req.body.username, 
                req.body.password, 
                req.user.user_id);
            return res.status(out.statusCode).send(out.data);
        } catch (err) {
            return res.status(err.statusCode).send(err.msg);
        }
    }

    static async update_creds (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');
            const out = await UserService.update_creds(req.body.user_id,
                req.body.username,
                req.body.password,
                req.user.user_id);
                return res.status(out.statusCode).send(out.data);
        } catch (err) {
            return res.status(err.statusCode).send(err.msg);
        }
    }

    static async delete (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');
            const out = await UserService.delete(req.body.user_id, req.user.user_id);
        } catch (err) {
            return res.status(err.statusCode).send(err.msg);
        }
    }

    static init (router) {
        router.put('/user/create', auth, UserHandler.create);

        router.post('/user/update_creds', auth, UserHandler.update_creds);

        router.post('/user/delete', auth, UserHandler.delete);
    }
}

module.exports = {
    UserHandler: UserHandler
};