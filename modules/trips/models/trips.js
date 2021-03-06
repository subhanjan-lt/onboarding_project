const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TripsSchema = new Schema({
    status: {type: String, enum: {
        values: ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'UNFULFILLED']
    }, required: true},
    active: {type: Boolean, required: true},
    assigned_to: {type: Schema.Types.ObjectId, ref: 'Users'},
    start_time: {type: Number},
    actual_start_time: {type: Number},
    total_kms: {type: Number},
    start_kms: {type: Number},
    end_kms: {type: Number},
    actual_kms: {type: Number},
    rate_card_id: {type: Schema.Types.ObjectId, ref: 'RateCard'},
    changelog: {type: Schema.Types.Array},
    created_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'Users'},
}, {
    // TODO: Use Unix timestamps (seconds since Jan 1st, 1970)
    timestamps: true
});

const trips_model = mongoose.model("Trips", TripsSchema);
module.exports = trips_model;