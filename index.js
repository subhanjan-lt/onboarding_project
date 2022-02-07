const http = require("http");
const { app, express } = require("./app");
const { PODHandler } = require("./modules/pod/handlers/podHandler");
const { RateCardHandler } = require("./modules/rateCard/handlers/rateCardHandler");
const { TripHandler } = require("./modules/trips/handlers/tripHandler");
const { LoginHandler } = require("./modules/users/handlers/loginHandler");
const { UserHandler } = require("./modules/users/handlers/userHandler");
const Queue = require('bull');
const { PaymentRequestsJob } = require("./core/backgroundJobs/paymentRequestsJob");
const { PaymentRequestsHandler } = require("./modules/paymentRequests/handlers/paymentRequestsHandler");
const { LedgerHandler } = require("./modules/ledger/handlers/ledgerHandler");

// const server = http.createServer(app);
const router = express.Router();

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

//init module handlers
LoginHandler.init(router);
UserHandler.init(router);
RateCardHandler.init(router);
TripHandler.init(router);
PODHandler.init(router);
PaymentRequestsHandler.init(router);
LedgerHandler.init(router);

//queueing background jobs
const processPaymentRequestsQueue = new Queue('processPaymentRequests');
processPaymentRequestsQueue.on('completed', (job, result) => {
    console.log(`Job completed with result ${result}`);
});
processPaymentRequestsQueue.add({}, {repeat: {
    // every: 900000, //every 15 mins
    every: 60000
}});
processPaymentRequestsQueue.process(async job => {
    return await PaymentRequestsJob.job();
});

app.use('/api', router);
// server listening 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});