const http = require("http");
const { app, express } = require("./app");
const { PODHandler } = require("./modules/pod/handlers/podHandler");
const { RateCardHandler } = require("./modules/rateCard/handlers/rateCardHandler");
const { TripHandler } = require("./modules/trips/handlers/tripHandler");
const { LoginHandler } = require("./modules/users/handlers/loginHandler");
const { UserHandler } = require("./modules/users/handlers/userHandler");
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

app.use('/api', router);
// server listening 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});