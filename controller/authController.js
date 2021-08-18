const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendingMail = require('../utils/email');

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
const sendTokenAndResponse = (user, statusCode, req, res) => {
  const token = createToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = (Model) =>
  catchAsync(async (req, res, next) => {
    const {
      name,
      email,
      mobile,
      address,
      password,
      passwordConfirm,
      photo,
      connectionFor,
    } = req.body;

    const newUser = await Model.create({
      name,
      email,
      mobile,
      address,
      password,
      passwordConfirm,
      photo,
      connectionFor,
    });

    sendTokenAndResponse(newUser, 201, req, res);
  });

exports.login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { mobile, password } = req.body;

    if (!mobile || !password)
      return next(new AppError('Please enter valid data for login', 400));

    const user = await Model.findOne({ mobile }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password)))
      return next(new AppError('Either email or password is incorrect', 401));

    sendTokenAndResponse(user, 200, req, res);
  });
exports.protect = (Model) =>
  catchAsync(async (req, res, next) => {
    let token;
    // take out token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token)
      return next(
        new AppError('You are not logged in. Please login to get access', 401)
      );

    // verify the token

    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user still exists
    const currentUser = await Model.findById(payload.id);
    if (!currentUser)
      return next(
        new AppError('User not exist. Please login from another account', 401)
      );

    // check if user changed the password
    if (currentUser.passwordChangedAfter(payload.iat))
      return next(
        new AppError('User recently changed password. Please login again', 401)
      );

    req.user = currentUser;

    next();
  });

exports.loggedInUser = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        const payload = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
        const loggedUser = await Model.findById(payload.id);

        if (!loggedUser) return next();
        if (loggedUser.passwordChangedAfter(payload.iat)) {
          return next();
        }

        res.locals.user = loggedUser;

        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  });

exports.forgotPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.body.email)
      return next(new AppError('Please enter only email', 400));
    const email = req.body.email;

    const user = await Model.findOne({ email });
    if (!user)
      return next(
        new AppError('There is no user with this email. Try again', 404)
      );

    const passwordResetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //sending token through email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${passwordResetToken}`;

    const message = `This is the password reset link:\n ${resetURL} \nIncase if you don't wont to change password. Please ignore this email.`;

    const options = {
      email,
      subject: 'Your password reset link | Valid for 10 minutes',
      message,
    };

    try {
      await sendingMail(options);
      res.status(200).json({
        status: 'success',
        message: 'Password Reset link sent to your email. Please check!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('Problem sending email try again', 400));
    }
  });

exports.resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const resetToken = req.params.resetToken;
    const { password, passwordConfirm } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await Model.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gte: Date.now() },
    });

    if (!user) return next(new AppError('password reset link expires', 400));

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully. Please login again!',
    });
  });

exports.updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findById(req.user.id).select('+password');

    const { passwordCurrent, password, passwordConfirm } = req.body;

    if (!(await user.checkPassword(passwordCurrent, user.password)))
      return next(
        new AppError('Current Password you entered is incorrect', 400)
      );

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    sendTokenAndResponse(user, 200, req, res);
  });

exports.logout = (req, res) => {
  res.cookie('jwt', 'logging out', {
    expire: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};
