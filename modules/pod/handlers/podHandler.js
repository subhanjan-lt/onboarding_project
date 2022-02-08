const auth = require('../../../core/middleware/auth');
const { PODService } = require('../services/podService');
const multer  = require('multer')
const upload = multer({ dest: '/Users/lt/Documents/onboarding_project/modules/pod/uploads' })

class PODHandler {
    static init (router) {
        router.put('/pod/create', [auth, upload.single('pod')], async function (req, res) {
            await PODService.create(req, res);
        });

        router.post('/pod/process_pod', auth, async function (req, res) {
            await PODService.process_pod(req, res);
        });
    }
}

module.exports = {
    PODHandler: PODHandler
}