const { LoginUser, SignupUser } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const route = require('express').Router();

route.post('/',authMiddleware,LoginUser)
route.post('/signup',authMiddleware,SignupUser)
module.exports = route;