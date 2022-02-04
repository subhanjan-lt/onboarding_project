const users_model = require('../models/users');
const bcrypt = require('bcryptjs');

class UserService{
    static create = async function (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.name && req.body.role && req.body.username && req.body.password))
                return res.status(400).send('Incomplete information entered');

            const encrypted_password = await bcrypt.hash(req.body.password, 10);
            const newUser = await users_model.create({
                name: req.body.name,
                phone: req.body.phone,
                active: true,
                role: req.body.role,
                username: req.body.username,
                password: encrypted_password,
                created_by: req.user.user_id,
                updated_by: req.user.user_id
            });
            return res.status(200).json(newUser);
        } catch (err) {
            console.log(err);
        }
    }

    static update_creds = async function (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');

            const encrypted_password = null;
            if (req.body.password) encrypted_password = await bcrypt.hash(req.body.password, 10);
            const updatedUser = await users_model.findByIdAndUpdate(req.body.user_id, {
                username: req.body.username,
                password: encrypted_password
            });
            return res.status(200).json(updatedUser);
        } catch (err) {
            console.log(err);
        }
    }

    static delete = async function (req, res) {
        try {
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');

            const updatedUser = await users_model.findByIdAndUpdate(req.body.user_id, {active: false});
            return res.status(200).json(updatedUser);
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    UserService: UserService
}