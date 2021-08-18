const Contact = require('../model/contactModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createQuery = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  if (req.user.name !== req.body.name)
    return next(new AppError('Please enter valid registered name', 401));

  if (req.user.email !== req.body.email)
    return next(new AppError('Please enter valid registered email ID', 401));

  const query = await Contact.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      query,
    },
  });
});

exports.getAllQueries = catchAsync(async (req, res, next) => {
  const queries = await Contact.find().sort(req.query.sort);

  res.status(200).json({
    status: 'success',
    results: queries.length,
    data: {
      queries,
    },
  });
});
