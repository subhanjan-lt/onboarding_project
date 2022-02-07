const http = require("http");
const { app, express } = require("./app");
const { PODHandler } = require("./POD/handlers/pod_handler");
const { RateCardHandler } = require("./RateCard/handlers/rate_card_handler");
const { TripHandler } = require("./Trips/handlers/trip_handler");
const { LoginHandler } = require("./Users/handlers/login_handler");
const { UserHandler } = require("./Users/handlers/user_handler");
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