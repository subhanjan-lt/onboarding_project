const trips_model = require('../../trips/models/trips');
const users_model = require('../../users/models/users');
const pod_model = require('../models/pod');
const rate_card_model = require('../../rateCard/models/rateCard');
const payment_requests_model = require('../../paymentRequests/models/paymentRequests');

class PODService {
    static async create(admin, trip_id, file) {
        try {
            /*======== validity checks start ========*/
            const driver = await users_model.findById(admin.user_id);
            if (!(driver && driver.active)) return {statusCode: 400, data: "This action is not available till onboarding is complete"};
            const trip = await trips_model.findById(trip_id);
            if (!(trip && trip.active)) return {statusCode: 400, data: "Trip doesn't exist"};
            if (trip.status !== 'COMPLETED') return {statusCode: 400, data: "Trip hasn't been ended yet"};
            if (trip.assigned_to.toString() !== admin.user_id) return {statusCode: 400, data: "Not authorized to add POD for this trip"};
            /*======== validity checks end ========*/
            const pod = await pod_model.create({
                trip_id: trip_id,
                pod: file.path,
                status: 'CREATED',
                created_by: admin.user_id,
                updated_by: admin.user_id
            });
            return {statusCode: 200, data: pod};
            } catch (err) {
                console.log(err);
                return {statusCode: 500, data: {}, msg: err.message};
        }
    }

    static async process_pod (pod_id, approved, admin) {
        try {
            /*======== validity checks start ========*/
            const pod = await pod_model.findById(pod_id);
            if (!(pod && pod.status === 'CREATED')) return {statusCode: 400, data: "Not a valid POD, please try again"};
            /*======== validity checks end ========*/

            if (approved) {
                pod.status = 'APPROVED';
                const trip = await trips_model.findById(pod.trip_id);
                const rate_card = await rate_card_model.findById(trip.rate_card_id);

                const payment_request = await payment_requests_model.create({
                    trip_id: trip._id,
                    status: 'CREATED',
                    trip_amount: rate_card.price * trip.total_kms,
                    incentive: (trip.actual_kms > trip.total_kms) ? (trip.actual_kms-trip.total_kms) * rate_card.incentive : 0,
                    penalty: (trip.actual_start_time > trip.start_time) ? (trip.actual_start_time - trip.start_time) / 60 * rate_card.penalty : 0,
                    created_by: admin.user_id,
                    updated_by: admin.user_id,
                });
                pod.updated_by = admin.user_id;
                await pod.save();
                return {statusCode: 200, data: pod};
            } else {
                pod.status = 'REJECTED';
                pod.updated_by = admin.user_id;
                await pod.save();
                return {statusCode: 200, data: pod};
            }
        } catch (err) {
            console.log(err);
            return {statusCode: 500, data: {}, msg: err.message};
        }
    }
}

module.exports = {
    PODService: PODService
}