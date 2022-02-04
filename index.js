const http = require("http");
const { app, express } = require("./app");
const { LoginHandler } = require("./Users/handlers/login_handler");
const { UserHandler } = require("./Users/handlers/user_handler");
// const server = http.createServer(app);
const router = express.Router();

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

//init module handlers
LoginHandler.init(router);
UserHandler.init(router);

app.use('/api', router);
// server listening 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});