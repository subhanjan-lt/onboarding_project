const auth = require('../../../core/middleware/auth');
const { PaymentRequestsService } = require('../services/paymentRequestsService');

class PaymentRequestsHandler {
    static payment_requests = async function (req, res) {
        try {
            if (req.user.role !== 'PAYMENT_EXEC') return res.status(401).send('You are not authorized for this action');
            const out = PaymentRequestsService.payment_requests(req.query.pageSize, req.query.page);
            return res.status(out.statusCode).send(out.data);
        } catch (err) {
            return res.status(err.statusCode).send(err.data);
        }
    }
    static init = function (router) {
        router.get('/payment_requests/', auth, PaymentRequestsHandler.payment_requests);
    }
}

module.exports = {
    PaymentRequestsHandler: PaymentRequestsHandler
}