const rate_card_model = require('../models/rateCard');

class RateCardService {
    static async create (price, penalty, incentive, admin) {
        try {
            
            
            const newRateCard = await rate_card_model.create({
                price: price,
                penalty: penalty,
                incentive: incentive,
                created_by: admin.user_id,
                updated_by: admin.user_id,
            });

            return res.status(200).json(newRateCard);

        } catch (err) {
            console.log(err);
            return {statusCode: 500, data: {}, msg: err.message};
        }
    }
}

module.exports = {
    RateCardService: RateCardService
}