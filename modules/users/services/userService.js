const users_model = require('../models/users');
const bcrypt = require('bcryptjs');

class UserService{
    static create = async function (name, phone, role, username, password, user_id) {
        try {
            const encrypted_password = await bcrypt.hash(password, 10);
            const newUser = await users_model.create({
                name: name,
                phone: phone,
                active: true,
                role: role,
                username: username,
                password: encrypted_password,
                created_by: user_id,
                updated_by: user_id
            });
            return {statusCode: 200, data: newUser};
        } catch (err) {
            console.log(err);
        }
    }

    static update_creds = async function (user_id, username, password, admin_id) {
        try {
            const updatedUser = await users_model.findById(user_id);
            if (username) updatedUser.username = username;
            if (password) {
                const encrypted_password = await bcrypt.hash(password, 10);
                updatedUser.password = encrypted_password;
            }
            if (username || password) updatedUser.updated_by = admin_id;
            await updatedUser.save();
            return {statusCode: 200, data: updatedUser};
        } catch (err) {
            console.log(err);
        }
    }

    static delete = async function (user_id, admin_id) {
        try {
            const updatedUser = await users_model.findByIdAndUpdate(user_id, {
                active: false, 
                updated_by: admin_id
            });
            return {statusCode: 200, data: updatedUser};
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = {
    UserService: UserService
}