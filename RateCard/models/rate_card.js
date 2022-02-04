const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RateCardSchema = new Schema({
    price: {type: Number},
    penalty: {type: Number},
    incentive: {type: Number},
    created_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'Users'},
}, {
    // Use Unix timestamps (seconds since Jan 1st, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

const rate_card_model = mongoose.model("RateCard", RateCardSchema);
module.exports = rate_card_model;