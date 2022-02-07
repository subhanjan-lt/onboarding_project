const auth = require('../../Users/middleware/auth');
const trips_model = require('../../Trips/models/trips');
const users_model = require('../../Users/models/users');
const pod_model = require('../models/pod');
const rate_card_model = require('../../RateCard/models/rate_card');
const payment_requests_model = require('../../PaymentRequests/models/payment_requests');
const { PODService } = require('../services/pod_service');

class PODHandler {
    static init = function (router) {
        router.put('/pod/create', auth, async function (req, res) {
            await PODService.create(req, res);
        });

        router.post('/pod/process_pod', auth, async function (req, res) {
            await PODService.process_pod(req, res);
        });
    }
}

module.exports = {
    PODHandler: PODHandler
}