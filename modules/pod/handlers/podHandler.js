const auth = require('../../../core/middleware/auth');
const trips_model = require('../../trips/models/trips');
const users_model = require('../../users/models/users');
const pod_model = require('../models/pod');
const rate_card_model = require('../../rateCard/models/rateCard');
const payment_requests_model = require('../../paymentRequests/models/paymentRequests');
const { PODService } = require('../services/podService');

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