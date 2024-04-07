const express = require('express');
const passport = require('passport');
const AuthService = require('../services/authservice');

const authRouter = express.Router();
const authService = new AuthService();

authRouter.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await authService.loginUser(email, password);
        res.json({ token });
    } catch (error) {
        next(error);
    }
});

module.exports = authRouter;
