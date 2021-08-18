const Contact = require('../model/contactModel');
const User = require('../model/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.overview = (req, res, next) => {
  res.status(200).render('overview', {
    title: 'overview',
  });
};

exports.signup = (req, res, next) => {
  res.status(200).render('signup', {
    title: 'new user signup',
  });
};
exports.login = (req, res, next) => {
  res.status(200).render('login', {
    title: 'login to your account',
  });
};
exports.forgotPassword = (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'forgot password',
  });
};
exports.resetPassword = (req, res, next) => {
  res.status(200).render('resetPassword', {
    title: 'reset password',
  });
};

exports.getUser = (Model) =>
  catchAsync(async (req, res, next) => {
    let singleUser;
    if (req.params.slug !== 'admin') {
      singleUser = await Model.find({ slug: req.params.slug }).populate(
        'deliveries'
      );
    }
    if (req.params.slug === 'admin') {
      singleUser = await Model.find({ slug: req.params.slug });
    }

    if (!singleUser) return next();

    if (singleUser[0].role === 'admin') {
      return res.status(200).render('admin-allusers', {
        title: 'admin',
        singleUser,
      });
    }

    return res.status(200).render('user', {
      title: 'user',
      singleUser,
    });
  });

exports.allUser = (req, res, next) => {
  res.status(200).render('admin-allusers', {
    title: 'success',
  });
};

exports.adminGetUser = catchAsync(async (req, res, next) => {
  const [myuser] = await User.find({ slug: req.params.slug }).populate(
    'deliveries'
  );

  if (!myuser)
    return next(
      new AppError('User not exists, may be account is deleted', 404)
    );

  res.status(200).render('admin-get-user', {
    title: myuser.slug,
    myuser,
  });
});

exports.getAdminProfile = (req, res) => {
  res.status(200).render('admin-profile', {
    title: 'my profile',
  });
};

exports.getUserProfile = (req, res) => {
  res.status(200).render('user-profile', {
    title: 'my profile',
  });
};
exports.getAllQueries = catchAsync(async (req, res, next) => {
  const queries = await Contact.find().sort('-createdAt');
  res.status(200).render('admin-allqueries', {
    title: 'all queries',
    queries,
  });
});
