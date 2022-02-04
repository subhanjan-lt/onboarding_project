const login_history_model = require("../../LoginHistory/models/login_history");
const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = async function(req, res, next) {
    const token = req.headers["x-access-token"];
    if (!token) return res.status(403).send("Header token required for authorization");
    const session = await login_history_model.findOne({secret_key: token});
    if (session && session.logout_time) return res.status(401).send("Invalid Token");
    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        console.log(err);
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;