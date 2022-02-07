const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    name: {type: String, required: true},
    phone: {type: Number},
    active: {type: Boolean, required: true},
    role: {type: String, enum: {
        values: ['ADMIN', 'DRIVER', 'PAYMENT_EXEC']
    }, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    created_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'Users'}
}, {
    // TODO: Use Unix timestamps (seconds since Jan 1st, 1970)
    timestamps: true
});

const users_model = mongoose.model("Users", UsersSchema);
module.exports = users_model;