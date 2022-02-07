const auth = require('../../../core/middleware/auth');
const { PaymentRequestsService } = require('../services/paymentRequestsService');

class PaymentRequestsHandler {
    static init = function (router) {
        router.get('/payment_requests/', auth, async function (req, res) {
            await PaymentRequestsService.payment_requests(req, res);
        });
    }
}

module.exports = {
    PaymentRequestsHandler: PaymentRequestsHandler
}