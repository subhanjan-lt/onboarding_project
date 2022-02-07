const ledger_model = require('../models/ledger');

class LedgerService{
    static ledger = async function(req, res) {
        try {
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
            const page = req.query.page ? parseInt(req.query.page) : 0;
            const ledger = await ledger_model.find({}).sort({date: 'descending'})
                                                                .limit(pageSize).skip(pageSize * page);
            res.status(200).json(ledger);                
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    LedgerService: LedgerService
}