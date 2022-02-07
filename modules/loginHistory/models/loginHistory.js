const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginHistorySchema = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: 'Users', required: true}, 
    secret_key: {type: String},
    login_time: {type: Number},
    logout_time: {type: Number},
    created_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'Users'},
}, {
    // Use Unix timestamps (seconds since Jan 1st, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

const login_history_model = mongoose.model("LoginHistory", LoginHistorySchema);
module.exports = login_history_model;