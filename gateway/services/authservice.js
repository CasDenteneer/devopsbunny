const bcrypt = require('bcrypt');
const User = require('../database/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
    async getExistingPayload(payload) {
        const user = await User.findOne({ _id: payload.userId });
        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

        return token;
    }
}

module.exports = AuthService;