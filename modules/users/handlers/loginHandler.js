const auth = require('../../../core/middleware/auth');
const { LoginService } = require('../services/loginService');

class LoginHandler {
    static login = async function (req, res) {
        try {
            const { username, password } = req.body;
            if (!(username && password)) return res.status(400).send('Incomplete credentials entered');

            const out = await LoginService.login(username, password);
            return res.status(out.statusCode).send(out.data);
        } catch(err) {
            return res.status(err.statusCode).send(err.data);
        }
    }

    static logout = async function (req, res) {
        try {
            const token = req.headers["token"];
            const out = await LoginService.logout(token);
            return res.status(out.statusCode).send(out.data);
        } catch (err) {
            return res.status(err.statusCode).send(err.data);
        }
    }

    static init = function(router) {
        router.post('/user/login', LoginHandler.login);

        router.post('/user/logout', auth, LoginHandler.logout);
    }
}

module.exports = {
    LoginHandler: LoginHandler
};