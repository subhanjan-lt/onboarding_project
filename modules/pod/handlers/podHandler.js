const auth = require('../../../core/middleware/auth');
const { PODService } = require('../services/podService');
const multer  = require('multer')
const upload = multer({ dest: '/Users/lt/Documents/onboarding_project/modules/pod/uploads' })

class PODHandler {
    static async create(req, res) {
        try {
            if (req.user.role !== 'DRIVER') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.trip_id && req.file)) return res.status(400).send('Incomplete information entered');
            const out = await PODService.create(req.user, req.body.trip_id, req.file)
            return res.status(out.statusCode).send(out.data);
        }catch(err) {
            return res.status(err.statusCode).send(err.msg);
        }
    }

    static async process_pod (req, res) {
        try {
            if (req.user.role !== 'PAYMENT_EXEC') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.pod_id && req.body.approved !== undefined)) return res.status(400).send('Incomplete information entered');
            const out = await PODService.process_pod(req.body.pod_id, req.body.approved, req.user)
            return res.status(out.statusCode).send(out.data);
        }catch(err) {
            return res.status(err.statusCode).send(err.msg);
        }
    }

    static init (router) {
        router.put('/pod/create', [auth, upload.single('pod')], PODHandler.create);

        router.post('/pod/process_pod', auth,PODHandler.process_pod);
    }
}

module.exports = {
    PODHandler: PODHandler
}