const trips_model = require('../models/trips');
const users_model = require('../../Users/models/users');
const rate_card_model = require('../../RateCard/models/rate_card');

class TripService {
    static create = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.start_time && req.body.total_kms)) return res.status(400).send('Incomplete information entered');
            if (req.body.assigned_to) {
                if (!req.body.rate_card_id) return res.status(400).send('Driver cannot be assigned to trip before rate_card');
                const driver = await users_model.findById(req.body.assigned_to);
                if (!(driver && driver.active)) return res.status(400).send("Driver ID entered doesn't exist, please onboard driver first");
                if (driver.role !== 'DRIVER') return res.status(400).send("Trip can only be assigned to driver");
            } 
            /*======== validity checks end ========*/
            const newTrip = await trips_model.create({
                status: 'CREATED',
                active: true,
                assigned_to: req.body.assigned_to,
                start_time: req.body.start_time,
                actual_start_time: null,
                total_kms: req.body.total_kms,
                start_kms: null,
                end_kms: null,
                actual_kms: null,
                rate_card_id: req.body.rate_card_id,
                changelog: [],
                created_by: req.user.user_id,
                updated_by: req.user.user_id
            });
            newTrip.changelog.push({
                action: 'CREATED',
                created_by: req.user.user_id,
                created_on: Date.now() / 1000
            });
            if (req.body.rate_card_id) {
                newTrip.changelog.push({
                    action: 'ASSIGNED_RATE_CARD',
                    created_by: req.user.user_id,
                    created_on: Date.now() / 1000
                });
            }
            if (req.body.assigned_to) { 
                newTrip.status = 'ASSIGNED'; //TODO: use string consts
                newTrip.changelog.push({
                    action: 'ASSIGNED_DRIVER',
                    created_by: req.user.user_id,
                    created_on: Date.now() / 1000
                });
            } 
            await newTrip.save();
            return res.status(200).json(newTrip);
        } catch (err) {
            console.log(err);
        }
    };

    static deactivate = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.trip_id) return res.status(400).send("Incomplete information entered");
            const trip = await trips_model.findById(req.body.trip_id);
            if (!(trip && trip.active)) res.status(400).send("Trip doesn't exist");
            /*======== validity checks end ========*/
            
            trip.active = false;
            trip.updated_by = req.user.user_id;                
            trip.changelog.push({
                action: 'DEACTIVATED',
                created_by: req.user.user_id,
                created_on: Date.now() / 1000
            });
            await trip.save();
            return res.status(200).json(trip);
        } catch (err) {
            console.log(err);
        }
    };

    static assign_rate_card = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.body.rate_card_id)) return res.status(400).send("Incomplete information entered");
            const trip = await trips_model.findById(req.body.trip_id);
            if (!(trip && trip.active)) res.status(400).send("Trip doesn't exist");
            if (trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED') return res.status(400).send("Rate Card can't be assigned in this stage of the trip");
            const rate_card = await rate_card_model.findById(req.body.rate_card_id);
            if (!rate_card) res.status(400).send("Rate card doesn't exist");
            /*======== validity checks end ========*/

            trip.rate_card_id = req.body.rate_card_id;
            trip.updated_by = req.user.user_id;
            trip.changelog.push({
                action: 'ASSIGNED_RATE_CARD',
                created_by: req.user.user_id,
                created_on: Date.now() / 1000
            });
            await trip.save();
            return res.status(200).json(trip);

        } catch(err) {
            console.log(err);
        }
    };

    static assign_driver = async function(req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.body.user_id)) return res.status(400).send('Incomplete information entered');
            const trip = await trips_model.findById(req.body.trip_id);
            if (!(trip && trip.active)) return res.status(400).send("Trip doesn't exist");
            if (trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED') return res.status(400).send("Driver can't be assigned in this stage of the trip");
            if (!trip.rate_card_id) return res.status(400).send('Driver cannot be assigned to trip before rate_card');
            const driver = await users_model.findById(req.body.user_id);
            if (!(driver && driver.active)) return res.status(400).send("Driver ID entered doesn't exist, please onboard driver first");
            if (driver.role !== 'DRIVER') return res.status(400).send("Trip can only be assigned to driver");
            /*======== validity checks end ========*/

            trip.assigned_to = req.body.user_id;
            trip.status = 'ASSIGNED';
            trip.updated_by = req.user.user_id;
            trip.changelog.push({
                action: 'ASSIGNED_DRIVER',
                created_by: req.user.user_id,
                created_on: Date.now() / 1000
            });
            trip.save();
            return res.status(200).json(trip);
        } catch (err) {
            console.log(err);
        }
    };

    static fetch_trips = async function(req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            const driver = await users_model.findById(req.user.user_id);
            if (!(driver && driver.active)) return res.status(400).send('This action is not available till onboarding is complete');
            /*======== validity checks end ========*/
            const trips = await trips_model.find({assigned_to: req.user.user_id});
            const result = await Promise.all(trips.map(async trip => {
                    return {trip, rate_card: await rate_card_model.findById(trip.rate_card_id)};
                }));
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
        }
    };

    static start_trip = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            const driver = await users_model.findById(req.user.user_id);
            if (!(driver && driver.active)) return res.status(400).send("This action is not available till onboarding is complete");
            if (!(req.body.trip_id && req.body.start_kms !== undefined && req.body.actual_start_time)) return res.status(400).send('Incomplete information entered');
            const trip = await trips_model.findById(req.body.trip_id);
            if (!(trip && trip.active)) return res.status(400).send("Trip doesn't exist");
            if (trip.status !== 'ASSIGNED') return res.status(400).send("Trip hasn't been assigned yet");
            // console.log(trip.assigned_to.toString(), req.user.user_id);
            if (trip.assigned_to.toString() !== req.user.user_id) return res.status(400).send("Trip hasn't been assigned to you");
            /*======== validity checks end ========*/

            trip.start_kms = req.body.start_kms;
            trip.actual_start_time = req.body.actual_start_time;
            trip.status = 'IN_PROGRESS';
            trip.updated_by = req.user.user_id;
            trip.changelog.push({
                action: 'TRIP_STARTED',
                created_by: req.user.user_id,
                created_on: Date.now() / 1000
            });
            trip.save();
            return res.status(200).json({trip, rate_card: await rate_card_model.findById(trip.rate_card_id)});
        } catch (err) {
            console.log(err);
        }
    };

    static end_trip = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            const driver = await users_model.findById(req.user.user_id);
            if (!(driver && driver.active)) return res.status(400).send("This action is not available till onboarding is complete");
            if (!(req.body.trip_id && req.body.end_kms)) return res.status(400).send('Incomplete information entered');
            const trip = await trips_model.findById(req.body.trip_id);
            if (!(trip && trip.active)) return res.status(400).send("Trip doesn't exist");
            if (trip.status !== 'IN_PROGRESS') return res.status(400).send("Trip hasn't been started yet, please start trip first");
            if (trip.assigned_to.toString() !== req.user.user_id) return res.status(400).send("Trip hasn't been assigned to you");
            /*======== validity checks end ========*/

            trip.end_kms = req.body.end_kms;
            trip.actual_kms = trip.end_kms - trip.start_kms;
            trip.status = 'COMPLETED';
            trip.updated_by = req.user.user_id;
            trip.changelog.push({
                action: 'TRIP_ENDED',
                created_by: req.user.user_id,
                created_on: Date.now() / 1000
            });
            trip.save();
            return res.status(200).json({trip, rate_card: await rate_card_model.findById(trip.rate_card_id)});
        } catch (err) {
            console.log(err);
        }
    };
}

module.exports = {
    TripService: TripService
}