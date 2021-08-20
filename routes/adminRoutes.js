const express = require('express');

const Admin = require('../model/adminModel');
const User = require('../model/userModel');
const authController = require('../controller/authController');
const userController = require('../controller/userController');
const queryController = require('../controller/queryController');

const router = express.Router();

router.post('/signup', authController.signup(Admin));
router.post('/login', authController.login(Admin));
router.post('/forgotPassword', authController.forgotPassword(Admin));
router.post('/resetPassword/:resetToken', authController.resetPassword(Admin));
router.post(
  '/updatePassword',
  authController.protect(Admin),
  authController.updatePassword(Admin)
);

router.post(
  '/deliveryStatus',
  authController.protect(Admin),
  userController.deliveryStatus
);
router.delete(
  '/deleteAllDeleveries',
  authController.protect(Admin),
  userController.deleteAllDeleveries
);

router.patch(
  '/updateMe',
  authController.protect(Admin),
  userController.updateUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe(Admin)
);

router.use(authController.protect(Admin));
router.route('/').get(userController.getAllUsers);

router.get('/getMe', userController.getMe, userController.getUser(Admin));
router.get('/allQueries', queryController.getAllQueries);

router
  .route('/getUser/:id')
  .patch(userController.updateUser)
  .get(userController.getUser(User))
  .delete(userController.deleteUser);

module.exports = router;
