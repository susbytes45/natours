const express = require('express');
const fs = require('fs');
// const { axiosfunn } = require('./delete.js');
const appError = require('./appError.js');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/tourroutes.js');
const userRouter = require('./routes/userroutes.js');
const viewRouter = require('./routes/viewroutes.js');
const reviewRouter = require('./routes/reviewroutes.js');
const bookingRouter = require('./routes/bookingroutes.js');
const errorHandler = require('./controllers/errorController.js');

// console.log(process.env.NODE_ENV);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
if (process.env.NODE_ENV == 'devlopment') {
  app.use(morgan('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many ip from this address try again after 1 hour'
});
app.use('/api', limiter);
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      baseUri: ["'self'"],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrc: ["'self'", 'https://*.stripe.com'],

      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

      frameSrc: ["'self'", 'https://*.stripe.com'],

      objectSrc: ["'none'"],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      workerSrc: ["'self'", 'data:', 'blob:'],

      childSrc: ["'self'", 'blob:'],

      imgSrc: ["'self'", 'data:', 'blob:'],

      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

      upgradeInsecureRequests: []
    }
  })
);
// app.use(helmet())

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// app.get('/', (req, res) => {
//   res.status(200).send('hello from server');
// });
// app.post('/post', (req, res) => {
//   res.status(200).json({ name: 'sushil' });
// });

app.use((req, res, next) => {
  // console.log('hello from middle ware');
  // console.log(req.cookies);
  next();
});
app.use(compression());
app.use((req, res, next) => {
  req.reqquestTime = new Date().toISOString();
  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id/', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// app.use('/api/v1/tours', tourRouter);

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // console.log('jajfkkk jdsjkvjkkj');
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cant find${req.originalUrl} on this server`
  // });
  // const err = new Error('can find this route');
  next(new appError('cant find any route', 404));
});
app.use(errorHandler);

module.exports = app;
//
