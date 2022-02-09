const auth = require('../../../core/middleware/auth');
const { TripService } = require('../services/tripService');

class TripHandler {
    static async create (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.start_time && req.body.total_kms)) return res.status(400).send('Incomplete information entered');
            const out = await TripService.create(req.body.assigned_to, 
                req.body.rate_card_id, 
                req.body.start_time, 
                req.body.total_kms, 
                req.user);
        } catch (err) {
            res.status(err.statusCode).send(err.msg);
        }
    }

    static async deactivate (req, res) {
        try{
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.trip_id) return res.status(400).send("Incomplete information entered");
            const out = await TripService.deactivate(req.body.trip_id, req.user);
            res.status(out.statusCode).send(out.data);
        }catch(err){
            res.status(err.statusCode).send(err.msg);
        }
    }

    static async assign_rate_card (req, res) {
        try{
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.body.rate_card_id)) return res.status(400).send("Incomplete information entered");
            const out = await TripService.assign_rate_card(req.body.trip_id, req.body.user_id, req.user)
            res.status(out.statusCode).send(out.data);
        }catch(err) {
            res.status(err.statusCode).send(err.msg);
        }
    }
    static async assign_driver (req, res) {
        try{
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.body.user_id)) return res.status(400).send('Incomplete information entered');
            const out = await TripService.assign_driver(req.body.trip_id, req.body.rate_card_id, req.user)
            res.status(out.statusCode).send(out.data);
        }catch(err) {
            res.status(err.statusCode).send(err.msg);
        }
    }

    static async fetch_trips (req, res) {
        try{
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            const out = await TripService.fetch_trips(req.user);
            res.status(out.statusCode).send(out.data);
        }catch(err) {
            res.status(err.statusCode).send(err.msg);
        }
    }

    static async start_trip (req, res) {
        try{
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.body.start_kms !== undefined && req.body.actual_start_time)) return res.status(400).send('Incomplete information entered');
            const out = await TripService.start_trip(req.user, 
                req.body.trip_id, 
                req.body.start_kms, 
                req.body.actual_start_time);
            res.status(out.statusCode).send(out.data);
        }catch(err) {
            res.status(err.statusCode).send(err.msg);
        }
    }

    static async end_trip (req, res) {
        try{
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.body.end_kms)) return res.status(400).send('Incomplete information entered');
            const out = await TripService.end_trip(req.user, 
                req.body.trip_id, 
                req.body.end_kms);
            res.status(out.statusCode).send(out.data);
        }catch(err) {
            res.status(err.statusCode).send(err.msg);
        }
    }

    static init (router) {
        router.put('/trip/create', auth, TripHandler.create);

        router.post('/trip/deactivate', auth, TripHandler.deactivate);

        router.post('/trip/assign_rate_card', auth, TripHandler.assign_rate_card);

        router.post('/trip/assign_driver', auth, TripHandler.assign_driver);

        router.get('/trip/fetch_trips', auth, TripHandler.fetch_trips);

        router.post('/trip/start_trip', auth, TripHandler.start_trip)

        router.post('/trip/end_trip', auth, TripHandler.end_trip);
    }
}

module.exports = {
    TripHandler: TripHandler
}
