const appError = require('../appError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 404;
  err.status = err.status || 'fail';
  console.log(err);
  const handlejsonwebtokenerror = err => {
    return new appError('invalid token please login ', 401);
  };
  if (process.env.NODE_ENV === 'devlopment') {
    if (req.originalUrl.startsWith('/api')) {
      // api
      console.error(err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        err,
        err_stack: err.stack
      });
    } else {
      // rendereed website
      return res.status(err.statusCode).render('error', {
        title: 'something went wrong',
        msg: err.message
      });
    }
  } else if (process.env.NODE_ENV === 'production') {
    if (req.originalUrl.startsWith('/api')) {
      // console.log('prod');
      if (err.name == 'CastError') {
        const messag = `we cannot find ${err.path} of this ${err.value}`;
        err = new appError(messag, 400);
      }
      if ((err.code = 1100)) {
        const messag = `duplicate value is there please check i.e  `;
        err = new appError(messag, 400);
      }
      if ((err.name = 'ValidatorError')) {
        const messag = 'invalid input';
        err = new appError(messag, 400);
      }
      if ((err.name = 'JsonWebTokenError')) {
        err = handlejsonwebtokenerror(err);
      }
      if (err.isOperational) {
        res
          .status(err.statusCode)
          .json({ status: err.status, message: err.message });
      } else {
        res
          .status(500)
          .json({ status: 'fail', message: 'Something went wrong' });
      }
    } else {
      // console.log('from produ error');
      if (err.name == 'CastError') {
        const messag = `we cannot find ${err.path} of this ${err.value}`;
        err = new appError(messag, 400);
      }
      if (err.code == 1100) {
        const messag = `duplicate value is there please check i.e  `;
        err = new appError(messag, 400);
      }
      if (err.name == 'ValidatorError') {
        const messag = 'invalid input';
        err = new appError(messag, 400);
      }
      if (err.name == 'JsonWebTokenError') {
        err = handlejsonwebtokenerror(err);
      }
      if (err.isOperational) {
        return res.status(err.statusCode).render('error', { msg: err.message });
      } else {
        return res
          .status(500)
          .json({ status: 'fail', message: 'please try again later' });
      }
    }
  }
};
