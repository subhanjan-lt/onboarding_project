const auth = require('../../../core/middleware/auth');
const { UserService } = require('../services/userService');

class UserHandler {
    static init (router) {
        router.put('/user/create', auth, async function (req, res) {
            await UserService.create(req, res);
        });

        router.post('/user/update_creds', auth, async function (req, res) {
            await UserService.update_creds(req, res);
        });

        router.post('/user/delete', auth, async function (req, res) {
            await UserService.delete(req, res);
        });
    }
}

module.exports = {
    UserHandler: UserHandler
};