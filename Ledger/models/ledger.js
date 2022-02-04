const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LedgerSchema = new Schema({
    amount: {type: Number},
    user_id: {type: Schema.Types.ObjectId, ref: 'Users', required: true},
    date: {type: Number, required: true},
    type: {type: String, enum: {
        values: ['DEBIT', 'CREDIT']
    }, required: true},
    created_by: {type: Schema.Types.ObjectId, ref: 'Users'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'Users'},
}, {
    // Use Unix timestamps (seconds since Jan 1st, 1970)
    timestamps: { currentTime: () => Math.floor(Date.now() / 1000) }
});

const ledger_model = mongoose.model("Ledger", LedgerSchema);
module.exports = ledger_model;