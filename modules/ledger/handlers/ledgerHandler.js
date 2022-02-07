const { LedgerService } = require('../services/ledgerService');

class LedgerHandler {
    static init = function (router) {
        router.get('/ledger/', async function (req, res) {
           await LedgerService.ledger(req, res);
        });
    }
}

module.exports = {
    LedgerHandler: LedgerHandler
}