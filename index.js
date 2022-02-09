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
const socket = require ('socket.io');
const socketAuth = require('./core/middleware/socket');

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
    if (result && result.length > 0) {
        //send socket messages to recipients of all successful payments
        result.array.forEach(ledgerEntry => {
            io.sockets.to(ledgerEntry.user_id).emit(
                'notifications',
                `Amount of ${ledgerEntry.amount} rupees has been ${ledgerEntry.type}ED to your account`
            );
        });
    }
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
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Socket setup
const io = socket(server);
io.use(socketAuth);
io.on('connection', (socket) => {
    console.log(`Client with user_id ${socket.request.user.user_id} has connected`);
    socket.join(socket.request.user.user_id);

    io.sockets.to(socket.request.user.user_id).emit('notifications', 'test');
})