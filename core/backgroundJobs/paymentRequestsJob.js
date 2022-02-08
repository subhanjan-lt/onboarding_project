const payment_requests_model = require('../../modules/paymentRequests/models/paymentRequests');
const trips_model = require('../../modules/trips/models/trips');
const ledger_model = require('../../modules/ledger/models/ledger');

class PaymentRequestsJob {
    static job = async function () {
        const pendingPaymentRequests = await payment_requests_model.find({status: 'CREATED'}).sort({createdAt: 'ascending'});
        const result = await Promise.all(pendingPaymentRequests.map(async pendingPaymentRequest => {
            const total = pendingPaymentRequest.trip_amount + 
                            pendingPaymentRequest.incentive -
                            pendingPaymentRequest.penalty;
            const trip = await trips_model.findById(pendingPaymentRequest.trip_id);
            try {
                const ledgerEntry = await ledger_model.create({
                    amount: total,
                    user_id: trip.assigned_to,
                    date: Date.now() / 1000,
                    type: (total > 0) ? 'DEBIT' : 'CREDIT'
                });
                pendingPaymentRequest.status = 'SUCCESS';
                await pendingPaymentRequest.save();
                return ledgerEntry;
            } catch (err) {
                console.log(err);
                return {statusCode: 500, data: {}, msg: err.message};
            }
        }));
        return result;
    }
}

module.exports = {
    PaymentRequestsJob: PaymentRequestsJob
}