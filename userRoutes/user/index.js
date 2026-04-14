const userRoutes = require('express').Router();

const loginHandler = require('./login.js');
const registerHandler = require('./register.js');
const refreshHandler = require('./refresh.js');
const verifyHandler = require('./verify.js');


userRoutes.post('/login', loginHandler);
userRoutes.post('/register', registerHandler);
userRoutes.post('/refresh', refreshHandler);
userRoutes.get('/verify', verifyHandler);


module.exports = userRoutes;