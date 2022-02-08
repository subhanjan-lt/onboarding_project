const payment_requests_model = require('../models/paymentRequests');

class PaymentRequestsService {
    static async payment_requests (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'PAYMENT_EXEC') return res.status(401).send('You are not authorized for this action');
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
            const page = req.query.page ? parseInt(req.query.page) : 0;
            const payment_requests = await payment_requests_model.find({}).sort({updatedAt: 'descending'})
                                                                .limit(pageSize).skip(pageSize * page);
            res.status(200).json(payment_requests);                
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    PaymentRequestsService: PaymentRequestsService
}