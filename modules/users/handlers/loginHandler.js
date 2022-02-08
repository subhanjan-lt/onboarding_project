const auth = require('../../../core/middleware/auth');
const { LoginService } = require('../services/loginService');

class LoginHandler {
    static init (router) {
        router.post('/user/login', async function(req, res) {
            await LoginService.login(req, res);
        });

        router.post('/user/logout', auth, async function (req, res) {
            await LoginService.logout(req, res);
        });
    }
}

module.exports = {
    LoginHandler: LoginHandler
};