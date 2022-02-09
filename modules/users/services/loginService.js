const users_model = require('../models/users');
const login_history_model = require('../../loginHistory/models/loginHistory');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginService {
    static async login (username, password) {
        try {

            const user = await users_model.findOne({username: username});
            if (user && user.active) {
                const currSession = await login_history_model.findOne({user_id: user._id, logout_time: null});
                if (currSession) {
                    return {statusCode: 400, data: 'User currently logged into system, please logout first'};
                }

                if ((await bcrypt.compare(password, user.password))) {
                    // Generate JWT
                    const token = jwt.sign(
                        {user_id: user._id, role: user.role},
                        process.env.TOKEN_KEY,
                        {expiresIn: "1h"}
                    );

                    const session = await login_history_model.create({
                        user_id: user._id, 
                        secret_key: token,
                        login_time: Date.now() / 1000,
                        logout_time: null,
                        created_by: user._id,
                        updated_by: user._id,
                    });
                    return {
                        statusCode: 200,
                        data: {
                            user: user,
                            secret_key: token
                        }
                    }
                } else {
                    return {statusCode: 400, data: 'Invalid credentials'};
                }
            } else return {statusCode: 400, data: 'User not found'};
        } catch (err) {
            console.log(err);
            return {statusCode: 500, data: {}, msg: err.message};
        }
    }

    static async logout (token) {
        try {
            const token = req.headers["token"];
            const currSession = await login_history_model.findOneAndUpdate({secret_key: token}, {logout_time: Date.now() / 1000});
            if (!currSession) {
                return {statusCode: 400, data: 'User is not logged into system, please login first'}
            }
            else return {statusCode: 200, data: {success: true}};
        } catch (err) {
            console.log(err);
            return {statusCode: 500, data: {}, msg: err.message};
        }
    }
}

module.exports = {
    LoginService: LoginService
};