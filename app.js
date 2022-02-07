require("dotenv").config();
require("./core/config/database").connect();
const express = require("express");

const app = express();

app.use(express.static('public'));
app.use(express.json());

//global error-handling middleware
app.use(function(err, req, res, next) {
    res.status(err).send({error: err.message});
});

module.exports = {
    app: app,
    express: express
};