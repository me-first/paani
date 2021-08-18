const AppError = require('../utils/AppError');

const handleDuplicateValueError = (error) =>
  new AppError(`Value you entered ${error.keyValue} already exists`, 400);

const handleValidationError = (error) => new AppError(`${error.message}`, 400);

const handleJWTError = (error) =>
  new AppError(`Token manipulated: ${error.message}`, 401);
const handleJWTExpiresError = (error) =>
  new AppError(`Token expires: ${error.message}`, 401);

const sendDevErrors = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });

  //RENDER WEBSITE
  console.log(err);
  return res.status(err.statusCode).render('error', {
    title: 'error',
    message: err.message,
  });
};
const sendProdErrors = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational)
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

    console.log(err + '💥');
    res.status(err.statusCode).json({
      status: err.status,
      message: 'Something went wrong there',
    });
  }

  //RENDER WEBSITE
  if (err.isOperational)
    return res.status(err.statusCode).render('error', {
      title: 'error',
      message: err.message,
    });

  console.log(err + '💥');
  return res.status(err.statusCode).render('error', {
    title: 'error',
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    sendProdErrors(error, req, res);

    if (error.name === 'MongoError') error = handleDuplicateValueError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiresError(error);
  }

  if (process.env.NODE_ENV === 'development') {
    sendDevErrors(err, req, res);
  }
};
