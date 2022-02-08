const rate_card_model = require('../models/rateCard');

class RateCardService {
    static async reate (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.price && req.body.penalty && req.body.incentive)) 
                return res.status(400).send('Incomplete information entered');
            
            const newRateCard = await rate_card_model.create({
                price: req.body.price,
                penalty: req.body.penalty,
                incentive: req.body.incentive,
                created_by: req.user.user_id,
                updated_by: req.user.user_id,
            });

            return res.status(200).json(newRateCard);

        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    RateCardService: RateCardService
}