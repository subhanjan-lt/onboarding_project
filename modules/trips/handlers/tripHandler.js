const auth = require('../../../core/middleware/auth');
const { TripService } = require('../services/tripService');

class TripHandler {
    static init = function(router) {
        router.put('/trip/create', auth, async function (req, res) {
            await TripService.create(req, res);
        });

        router.post('/trip/deactivate', auth, async function(req, res) {
            await TripService.deactivate(req, res);
        });

        router.post('/trip/assign_rate_card', auth, async function(req, res) {
            await TripService.assign_rate_card(req, res);
        });

        router.post('/trip/assign_driver', auth, async function (req, res) {
            await TripService.assign_driver(req,res);
        });

        router.get('/trip/fetch_trips', auth, async function (req, res) {
            await TripService.fetch_trips(req, res);
        });

        router.post('/trip/start_trip', auth, async function(req, res) {
            await TripService.start_trip(req, res);
        })

        router.post('/trip/end_trip', auth, async function(req, res) {
            await TripService.end_trip(req, res);
        });
    }
}

module.exports = {
    TripHandler: TripHandler
}
