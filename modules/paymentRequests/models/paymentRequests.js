const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentRequestsSchema = new Schema({
    trip_id: {type: Schema.Types.ObjectId, ref: 'Trips', required: true},
    status: {type: String, enum: {
        values: ['CREATED', 'SUCCESS', 'FAILED']
    }, required: true},
    trip_amount: {type: Number},
    incentive: {type: Number},
    penalty: {type: Number},
    created_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'Users'},
}, {
    // Use Unix timestamps (seconds since Jan 1st, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

const payment_requests_model = mongoose.model("PaymentRequests", PaymentRequestsSchema);
module.exports = payment_requests_model;