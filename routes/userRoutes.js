const express = require('express');
const User = require('../model/userModel');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
const queryController = require('../controller/queryController');
const viewController = require('../controller/viewController');

const router = express.Router();

router.get('/logout', authController.logout);
router.post('/signup', authController.signup(User));
router.post('/login', authController.login(User));
router.post('/forgotPassword', authController.forgotPassword(User));
router
  .route('/resetPassword/:resetToken')
  .post(authController.resetPassword(User))
  .get(viewController.resetPassword);
router.post(
  '/updatePassword',
  authController.protect(User),
  authController.updatePassword(User)
);

router.post(
  '/createQuery',
  authController.protect(User),
  queryController.createQuery
);

router.get(
  '/getMe',
  authController.protect(User),
  userController.getMe,
  userController.getUser(User)
);

router.patch(
  '/updateMe',
  authController.protect(User),
  userController.updateUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe(User)
);

module.exports = router;
