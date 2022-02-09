const login_history_model = require('../../modules/loginHistory/models/loginHistory')
const jwt = require('jsonwebtoken');
const config = process.env;

const verifySocketToken = async function (socket, next) {
    try {
        const token = socket.handshake.headers['token']
        if (!token) throw("Header token required for authorization");
        const session = await login_history_model.findOne({secret_key: token});
        if (session && session.logout_time) throw("Invalid Token");
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        socket.request.user = decoded;
    } catch (err) {
        console.log(err);
        if (err instanceof jwt.TokenExpiredError && session && !session.logout_time) {
            return next("JWT key expired, please log back in");
        }
        return next("Invalid Token");
    }
    return next();
}

module.exports = verifySocketToken;