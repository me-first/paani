const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/userModel');
const Day = require('../model/dayModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Please upload only image file', 400));
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.updateUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  //FILTER
  const queryObj = { ...req.query };
  const execludeFields = ['sort', 'fields', 'page', 'limit'];
  execludeFields.forEach((el) => delete queryObj[el]);

  let query = User.find(queryObj);

  //SORT
  if (req.query.sort) {
    query = query.sort(req.query.sort.split(',').join(' '));
  }

  //FIELD SLECTING
  if (req.query.fields) {
    query = query.select(req.query.fields.split(',').join(' '));
  }

  //PAGINATION

  if (req.query.page || req.query.limit) {
    const limit = +req.query.limit || 10;
    const page = +req.query.page || 1;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const users = await query.populate({
    path: 'deliveries',
  });
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  await User.findByIdAndDelete(userId);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findById(req.params.id)
      .populate({
        path: 'deliveries',
      })
      .populate('queries');

    if (!user)
      return next(new AppError('User with this id no longer exist', 404));

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  });

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('Cannot update password property of user', 401));

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user)
    return next(new AppError('User with this id no longer exist', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

const filterObj = (obj, ...allowedFields) => {
  const objToArr = Object.entries(obj);
  const filteredArray = objToArr.filter(
    ([key, value], i) => key === allowedFields[i]
  );

  const filteredObj = Object.assign(
    ...filteredArray.map(([key, val]) => ({ [key]: val }))
  );

  return filteredObj;
};

exports.updateMe = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
      return next(
        new AppError('To update password, please visit /updatePassword', 400)
      );

    const obj = filterObj(req.body, 'name', 'mobile', 'email');
    if (req.file) obj.photo = req.file.filename;

    const user = await Model.findByIdAndUpdate(req.user.id, obj, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  });

exports.deliveryStatus = catchAsync(async (req, res, next) => {
  const day = await Day.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      day,
    },
  });
});

exports.deleteAllDeleveries = catchAsync(async (req, res, next) => {
  await Day.deleteMany();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
