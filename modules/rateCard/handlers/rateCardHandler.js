const auth = require('../../../core/middleware/auth');
const { RateCardService } = require('../services/rateCardService');


class RateCardHandler {
    static async create (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.price && req.body.penalty && req.body.incentive)) 
                return res.status(400).send('Incomplete information entered');
            const out = await RateCardService.create(req.body.price, req.body.penalty, req.body.incentive, req.user);
            return res.status(out.statusCode).send(out.data);
        } catch(err) {
            return res.status(err.statusCode).send(err.msg);
        }
    }

    static init (router) {
        router.put('/rate_card/create', auth, RateCardHandler.create);
    }
}

module.exports = {
    RateCardHandler: RateCardHandler
}