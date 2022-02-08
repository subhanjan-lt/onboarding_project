const auth = require('../../../core/middleware/auth');
const { RateCardService } = require('../services/rateCardService');


class RateCardHandler {
    static init (router) {
        router.put('/rate_card/create', auth, async function (req, res) {
            await RateCardService.create(req, res);
        });
    }
}

module.exports = {
    RateCardHandler: RateCardHandler
}