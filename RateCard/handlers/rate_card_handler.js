const auth = require('../../Users/middleware/auth');
const { RateCardService } = require('../services/rate_card_service');


class RateCardHandler {
    static init = function (router) {
        router.put('/rate_card/create', auth, async function (req, res) {
            await RateCardService.create(req, res);
        });
    }
}

module.exports = {
    RateCardHandler: RateCardHandler
}