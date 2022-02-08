const trips_model = require('../models/trips');
const users_model = require('../../users/models/users');
const rate_card_model = require('../../rateCard/models/rateCard');

class TripService {
    static create = async function (assigned_to, rate_card_id, start_time, total_kms, admin) {
        try {
            /*======== validity checks start ========*/
            if (assigned_to) {
                if (!rate_card_id) return {statusCode: 400, date: 'Driver cannot be assigned to trip before rate_card'};
                const driver = await users_model.findById(assigned_to);
                if (!(driver && driver.active)) return {statusCode: 400, data: "Driver ID entered doesn't exist, please onboard driver first"};
                if (driver.role !== 'DRIVER') return {statusCode: 400, data: "Trip can only be assigned to driver"};
            } 
            /*======== validity checks end ========*/
            const newTrip = await trips_model.create({
                status: 'CREATED',
                active: true,
                assigned_to: assigned_to,
                start_time: start_time,
                actual_start_time: null,
                total_kms: total_kms,
                start_kms: null,
                end_kms: null,
                actual_kms: null,
                rate_card_id: rate_card_id,
                changelog: [],
                created_by: admin.user_id,
                updated_by: admin.user_id
            });
            newTrip.changelog.push({
                action: 'CREATED',
                created_by: admin.user_id,
                created_on: Date.now() / 1000
            });
            if (rate_card_id) {
                newTrip.changelog.push({
                    action: 'ASSIGNED_RATE_CARD',
                    created_by: admin.user_id,
                    created_on: Date.now() / 1000
                });
            }
            if (assigned_to) { 
                newTrip.status = 'ASSIGNED'; //TODO: use string consts
                newTrip.changelog.push({
                    action: 'ASSIGNED_DRIVER',
                    created_by: admin.user_id,
                    created_on: Date.now() / 1000
                });
            } 
            await newTrip.save();
            return {statusCode: 200, data: newTrip};
        } catch (err) {
            console.log(err);
        }
    };

    static deactivate = async function (trip_id, admin) {
        try {
            /*======== validity checks start ========*/
            
            const trip = await trips_model.findById(trip_id);
            if (!(trip && trip.active)) return {statusCode: 400, data: "Trip doesn't exist"};
            /*======== validity checks end ========*/
            
            trip.active = false;
            trip.updated_by = admin.user_id;                
            trip.changelog.push({
                action: 'DEACTIVATED',
                created_by: admin.user_id,
                created_on: Date.now() / 1000
            });
            await trip.save();
            return {statusCode: 200, data: trip};
        } catch (err) {
            console.log(err);
        }
    };

    static assign_rate_card = async function (trip_id, rate_card_id, admin) {
        try {
            /*======== validity checks start ========*/
            
            const trip = await trips_model.findById(trip_id);
            if (!(trip && trip.active)) return {statusCode: 400, data: "Trip doesn't exist"};
            if (trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED') return {statusCode: 400, data: "Rate Card can't be assigned in this stage of the trip"};
            const rate_card = await rate_card_model.findById(rate_card_id);
            if (!rate_card) return {statusCode: 400, data: "Rate card doesn't exist"};
            /*======== validity checks end ========*/

            trip.rate_card_id = rate_card_id;
            trip.updated_by = admin.user_id;
            trip.changelog.push({
                action: 'ASSIGNED_RATE_CARD',
                created_by: admin.user_id,
                created_on: Date.now() / 1000
            });
            await trip.save();
            return {statusCode: 200, data: trip};

        } catch(err) {
            console.log(err);
        }
    };

    static assign_driver = async function(trip_id, user_id, admin) {
        try {
            /*======== validity checks start ========*/
            
            const trip = await trips_model.findById(trip_id);
            if (!(trip && trip.active)) return {statusCode: 400, data: "Trip doesn't exist"};
            if (trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED') return {statusCode: 400, data: "Driver can't be assigned in this stage of the trip"};
            if (!trip.rate_card_id) return {statusCode: 400, data: 'Driver cannot be assigned to trip before rate_card'};
            const driver = await users_model.findById(user_id);
            if (!(driver && driver.active)) return {statusCode: 400, data: "Driver ID entered doesn't exist, please onboard driver first"};
            if (driver.role !== 'DRIVER') return {statusCode: 400, data: "Trip can only be assigned to driver"};
            /*======== validity checks end ========*/

            trip.assigned_to = user_id;
            trip.status = 'ASSIGNED';
            trip.updated_by = admin.user_id;
            trip.changelog.push({
                action: 'ASSIGNED_DRIVER',
                created_by: admin.user_id,
                created_on: Date.now() / 1000
            });
            await trip.save();
            return {statusCode: 200, data:trip};
        } catch (err) {
            console.log(err);
        }
    };

    static fetch_trips = async function(admin) {
        try {
            /*======== validity checks start ========*/
            const driver = await users_model.findById(admin.user_id);
            if (!(driver && driver.active)) return {statusCode: 400, data: 'This action is not available till onboarding is complete'};
            /*======== validity checks end ========*/
            const trips = await trips_model.find({assigned_to: admin.user_id});
            const result = await Promise.all(trips.map(async trip => {
                    return {trip, rate_card: await rate_card_model.findById(trip.rate_card_id)};
                }));
            return {statusCode: 200, data:result};
        } catch(err) {
            console.log(err);
        }
    };

    static start_trip = async function (admin, trip_id, start_kms, actual_start_time) {
        try {
            /*======== validity checks start ========*/
            const driver = await users_model.findById(admin.user_id);
            if (!(driver && driver.active)) return {status:400, data: "This action is not available till onboarding is complete"};
            const trip = await trips_model.findById(trip_id);
            if (!(trip && trip.active)) return {status: 400, data: "Trip doesn't exist"};
            if (trip.status !== 'ASSIGNED') return {status:400, data: "Trip hasn't been assigned yet"};
            // console.log(trip.assigned_to.toString(), admin.user_id);
            if (trip.assigned_to.toString() !== admin.user_id) return {status: 400, data: "Trip hasn't been assigned to you"};
            /*======== validity checks end ========*/

            trip.start_kms = start_kms;
            trip.actual_start_time = actual_start_time;
            trip.status = 'IN_PROGRESS';
            trip.updated_by = admin.user_id;
            trip.changelog.push({
                action: 'TRIP_STARTED',
                created_by: admin.user_id,
                created_on: Date.now() / 1000
            });
            await trip.save();
            return {status: 200, data: {trip, rate_card: await rate_card_model.findById(trip.rate_card_id)}};
        } catch (err) {
            console.log(err);
        }
    };

    static end_trip = async function (admin, trip_id, end_kms) {
        try {
            /*======== validity checks start ========*/
            const driver = await users_model.findById(admin.user_id);
            if (!(driver && driver.active)) return {statusCode: 400, data: "This action is not available till onboarding is complete"};
            const trip = await trips_model.findById(trip_id);
            if (!(trip && trip.active)) return {statusCode: 400, data: "Trip doesn't exist"};
            if (trip.status !== 'IN_PROGRESS') return {statusCode: 400, data: "Trip hasn't been started yet, please start trip first"};
            if (trip.assigned_to.toString() !== admin.user_id) return {statusCode: 400, data: "Trip hasn't been assigned to you"};
            /*======== validity checks end ========*/

            trip.end_kms = end_kms;
            trip.actual_kms = trip.end_kms - trip.start_kms;
            trip.status = 'COMPLETED';
            trip.updated_by = admin.user_id;
            trip.changelog.push({
                action: 'TRIP_ENDED',
                created_by: admin.user_id,
                created_on: Date.now() / 1000
            });
            await trip.save();
            return {statusCode: 200, data: {trip, rate_card: await rate_card_model.findById(trip.rate_card_id)}};
        } catch (err) {
            console.log(err);
        }
    };
}

module.exports = {
    TripService: TripService
}