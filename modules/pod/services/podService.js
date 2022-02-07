const trips_model = require('../../trips/models/trips');
const users_model = require('../../users/models/users');
const pod_model = require('../models/pod');
const rate_card_model = require('../../rateCard/models/rateCard');
const payment_requests_model = require('../../paymentRequests/models/paymentRequests');

class PODService {
    static create = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            const driver = await users_model.findById(req.user.user_id);
            if (!(driver && driver.active)) return res.status(400).send("This action is not available till onboarding is complete");
            if (!(req.body.trip_id && req.body.pod)) return res.status(400).send('Incomplete information entered');
            const trip = await trips_model.findById(req.body.trip_id);
            if (!(trip && trip.active)) return res.status(400).send("Trip doesn't exist");
            if (trip.status !== 'COMPLETED') return res.status(400).send("Trip hasn't been ended yet");
            if (trip.assigned_to.toString() !== req.user.user_id) return res.status(400).send("Not authorized to add POD for this trip");;
            /*======== validity checks end ========*/

            const pod = await pod_model.create({
                trip_id: req.body.trip_id,
                pod: req.body.pod,
                status: 'CREATED',
                created_by: req.user.user_id,
                updated_by: req.user.user_id
            });
            return res.status(200).json(pod);
            } catch (err) {
                console.log(err);
        }
    }

    static process_pod = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'PAYMENT_EXEC') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.pod_id && req.body.approved !== undefined)) return res.status(400).send('Incomplete information entered');
            const pod = pod_model.findById(req.body.pod_id);
            if (!(pod && pod.status === 'CREATED')) res.status(400).send("Not a valid POD, please try again");
            /*======== validity checks end ========*/

            if (req.body.approved) {
                pod.status = 'APPROVED';
                const trip = trips_model.findById(pod.trip_id);
                const rate_card = rate_card_model.findById(trip.rate_card_id);

                const payment_request = payment_requests_model.create({
                    trip_id: trip._id,
                    status: 'CREATED',
                    trip_amount: rate_card.price * trip.total_kms,
                    incentive: (trip.actual_kms > trip.total_kms) ? (trip.actual_kms-trip.total_kms) * rate_card.incentive : 0,
                    penalty: (trip.actual_start_time > trip.start_time) ? (trip.actual_start_time - trip.start_time) / 60 * rate_card.penalty : 0,
                    created_by: req.user.user_id,
                    updated_by: req.user.user_id,
                });
                pod.updated_by = req.user.user_id;
                await pod.save();
                return res.status(200).json(pod);
            } else {
                pod.status = 'REJECTED';
                pod.updated_by = req.user.user_id;
                await pod.save();
                return res.status(200).json(pod);
            }
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    PODService: PODService
}