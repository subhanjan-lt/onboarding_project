const payment_requests_model = require('../models/paymentRequests');

class PaymentRequestsService {
    static payment_requests = async function (pageSize, page) {
        try {
            /*======== validity checks start ========*/
            
            const pageSize = pageSize ? parseInt(pageSize) : 0;
            const page = page ? parseInt(page) : 0;
            const payment_requests = await payment_requests_model.find({}).sort({updatedAt: 'descending'})
                                                                .limit(pageSize).skip(pageSize * page);
            return {statusCode: 200, data: payment_requests};                
        } catch (err) {
            console.log(err);
            return {statusCode: 500, data: {}, msg: err.message};
        }
    }
}

module.exports = {
    PaymentRequestsService: PaymentRequestsService
}