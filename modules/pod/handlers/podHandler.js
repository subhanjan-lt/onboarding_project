const auth = require('../../../core/middleware/auth');
const { PODService } = require('../services/podService');
const multer  = require('multer')
const upload = multer({ dest: '/Users/lt/Documents/onboarding_project/modules/pod/uploads' })

class PODHandler {
    static create = async function (req, res) {
        try {
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.file)) return res.status(400).send('Incomplete information entered');
            const out = PODService.create(req.user, req.body.trip_id, req.file)
            return res.status(out.statusCode).send(out.data);
        }catch(err) {
            return res.status(err.statusCode).send(err.data);
        }
    }

    static process_pod = async function (req, res) {
        try {
            if (req.user.role !== 'PAYMENT_EXEC') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.pod_id && req.body.approved !== undefined)) return res.status(400).send('Incomplete information entered');
            const out = PODService.process_pod(req.body.pod_id, req.body.approved, req.user)
            return res.status(out.statusCode).send(out.data);
        }catch(err) {
            return res.status(err.statusCode).send(err.data);
        }
    }

    static init = function (router) {
        router.put('/pod/create', [auth, upload.single('pod')], PODHandler.create);

        router.post('/pod/process_pod', auth,PODHandler.process_pod);
    }
}

module.exports = {
    PODHandler: PODHandler
}