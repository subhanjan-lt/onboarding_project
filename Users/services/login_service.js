const users_model = require('../models/users');
const login_history_model = require('../../LoginHistory/models/login_history');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginService {
    static login = async function (req, res) {
        try {
            const { username, password } = req.body;
            if (!(username && password)) return res.status(400).send('Incomplete credentials entered');

            const user = await users_model.findOne({username: username});
            if (user && user.active) {
                const currSession = await login_history_model.findOne({user_id: user._id, logout_time: null});
                if (currSession) {
                    return res.status(400).send('User currently logged into system, please logout first');
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
                    return res.status(200).send({ //TODO: figure out if .json() is needed
                        user: user,
                        secret_key: token
                    });
                } else {
                    return res.status(400).send('Invalid credentials');
                }
            } else return res.status(400).send('User not found');
        } catch (err) {
            console.log(err);
        }
    }

    static logout = async function (req, res) {
        try {
            const token = req.headers["x-access-token"];
            if (token) {
                const currSession = await login_history_model.findOneAndUpdate({secret_key: token}, {logout_time: Date.now() / 1000});
                if (!currSession) {
                    return res.status(400).send('User is not logged into system, please login first');
                }
                else return res.status(200).send({success: true});
            }
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    LoginService: LoginService
};