const users_model = require('../models/users');
const bcrypt = require('bcryptjs');

class UserService{
    static create = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!(req.body.name && req.body.role && req.body.username && req.body.password))
                return res.status(400).send('Incomplete information entered');
            /*======== validity checks end ========*/
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
            /*======== validity checks start ========*/
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');
            /*======== validity checks end ========*/
            const updatedUser = await users_model.findById(req.body.user_id);
            if (req.body.username) updatedUser.username = req.body.username;
            if (req.body.password) {
                const encrypted_password = await bcrypt.hash(req.body.password, 10);
                updatedUser.password = encrypted_password;
            }
            if (req.body.username || req.body.password) updatedUser.updated_by = req.user.user_id;
            await updatedUser.save();
            return res.status(200).json(updatedUser);
        } catch (err) {
            console.log(err);
        }
    }

    static delete = async function (req, res) {
        try {
            /*======== validity checks start ========*/
            if (req.user.role !== 'ADMIN') return res.status(401).send('You are not authorized for this action');
            if (!req.body.user_id) return res.status(400).send('Incomplete information entered');
            /*======== validity checks end ========*/
            const updatedUser = await users_model.findByIdAndUpdate(req.body.user_id, {
                active: false, 
                updated_by: req.user.user_id
            });
            return res.status(200).json(updatedUser);
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    UserService: UserService
}