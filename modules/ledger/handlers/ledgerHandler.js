const { LedgerService } = require('../services/ledgerService');

class LedgerHandler {
    static init (router) {
        router.get('/ledger/', async function (req, res) {
           await LedgerService.ledger(req, res);
        });
    }
}

module.exports = {
    LedgerHandler: LedgerHandler
}