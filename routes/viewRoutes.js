const express = require('express');

const User = require('../model/userModel');
const Admin = require('../model/adminModel');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.loggedInUser(User));
router.use(authController.loggedInUser(Admin));

router.get('/', viewController.overview);
router.get('/admin/myProfile', viewController.getAdminProfile);
router.get('/admin/allQueries', viewController.getAllQueries);
router.get('/user/myProfile', viewController.getUserProfile);
router.get('/signup', viewController.signup);
router.get('/login', viewController.login);
router.get('/forgotPassword', viewController.forgotPassword);
router.get('/user/:slug', viewController.getUser(User));
router.get('/admin/:slug', viewController.getUser(Admin));
router.get('/:slug', viewController.adminGetUser);
module.exports = router;
