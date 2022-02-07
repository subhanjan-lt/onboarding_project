const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PODSchema = new Schema({
    trip_id: {type: Schema.Types.ObjectId, ref: 'Trips', required: true},
    pod: {type: String, required: true},
    status: {type: String, enum: {
        values: ['CREATED', 'APPROVED', 'REJECTED']
    }, required: true},
    created_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'Users'},
}, {
    // Use Unix timestamps (seconds since Jan 1st, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

const pod_model = mongoose.model("POD", PODSchema);
module.exports = pod_model;