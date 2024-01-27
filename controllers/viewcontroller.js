const Tour = require('./../model/tourmodel');
const appError = require('./../appError');
const User = require('./../model/usermodel');
const Book = require('./../model/bookingmodel');
exports.getOverview = async (req, res, next) => {
  try {
    console.log('get overview from ');
    const tours = await Tour.find();
    res.status(200).render('overviewpug', {
      title: 'All tours',
      tours
    });
  } catch (err) {
    next(err);
  }
};
exports.getTour = async (req, res, next) => {
  console.log('from get tour');
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews'
    });
    if (!tour) {
      return next(new appError('tour with this name is not avaliable', 404));
    }
    // console.log('from get tour production');
    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "connect-src 'self' https://cdnjs.cloudflare.com"
      )
      .render('tour', {
        title: 'The forest Hiker Tour',
        tour
      });
  } catch (err) {
    return next(err);
  }
};
exports.loginview = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    // title: 'Your Account'
  });
};
exports.getMyTour = async (req, res, next) => {
  // 1)find all bookings
  const Bookings = await Book.find({ user: req.user.id });
  // 2)find the tours with returned ids
  const tourIds = Bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overviewpug', {
    title: 'my tours',
    tours
  });
};
exports.updateUserData = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
};
